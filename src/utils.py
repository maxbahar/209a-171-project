# Dependencies
import geopandas as gpd
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import seaborn as sns
import shap
import zipfile
from matplotlib.lines import Line2D
from sklearn.ensemble import RandomForestRegressor
from sklearn.inspection import permutation_importance
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import KFold, RandomizedSearchCV
from sklearn.preprocessing import StandardScaler

# Group demographic columns together

PREDICTORS_DICT = dict(
    registered = ["total_reg"],
    age = ["age_18_19", "age_20_24", "age_25_29", "age_30_34", "age_35_44", "age_45_54", "age_55_64", "age_65_74","age_75_84", "age_85over"],
    gender = [ "gender_m", "gender_f", "gender_unknown"],
    party = ["party_npp", "party_dem", "party_rep","party_lib", "party_grn", "party_con", "party_ain", "party_scl","party_oth"],
    ethnicity = ["eth1_eur", "eth1_hisp", "eth1_aa",
                    "eth1_esa", "eth1_oth", "eth1_unk"],
    languages = ["lang_english", "lang_spanish",
                    "lang_portuguese",
                    "lang_chinese", "lang_italian",
                    "lang_vietnamese", "lang_other",
                    "lang_unknown"],
    income= ["mean_hh_income"]
)

PREDICTORS_INIT_DICT = dict(
    init_gender = [ "voters_gender_m", "voters_gender_f", "voters_gender_unknown"],
    init_languages = ["languages_description_english", "languages_description_spanish",
                    "languages_description_portuguese",
                    "languages_description_chinese", "languages_description_italian",
                    "languages_description_vietnamese", "languages_description_other",
                    "languages_description_unknown"],
   init_income = ["commercialdata_estimatedhhincomeamount_avg"]
)

PREDICTORS = [item for sublist in PREDICTORS_DICT.values() for item in sublist]
SUBSET_PREDICTORS = ["mean_hh_income", "total_reg", 
                     "lang_unknown", "gender_f", "party_dem", 
                     "eth1_hisp", "eth1_eur", "eth1_aa", "eth1_oth",
                     "age_20_24", "age_25_29", "age_30_34", "age_45_54",]

def process_data(csv_zipfile="../data/MA_l2_2022stats_2020block.zip",
                 bg_zipfile="../data/ma_pl2020_bg.zip",
                 t_zipfile="../data/ma_pl2020_t.zip",
                 c_zipfile="../data/ma_pl2020_cnty.zip"):
    
    with zipfile.ZipFile(csv_zipfile) as z:
        with z.open("MA_l2_2022stats_2020block.csv") as f:
            voter_blocks_all = pd.read_csv(f, low_memory=False).set_index("geoid20")
    
    block_groups_shp = gpd.read_file(f"zip://{bg_zipfile}!ma_pl2020_bg.shp")
    tracts_shp = gpd.read_file(f"zip://{t_zipfile}!ma_pl2020_t.shp")
    counties_shp = gpd.read_file(f"zip://{c_zipfile}!ma_pl2020_cnty.shp")

    # Rename columns for easier intepretation
    col_labels = {k:v for k, v in zip(PREDICTORS_INIT_DICT["init_gender"], PREDICTORS_DICT["gender"])}
    col_labels.update({k:v for k,v in zip(PREDICTORS_INIT_DICT["init_languages"], PREDICTORS_DICT["languages"])})
    voter_blocks_all = voter_blocks_all.rename(col_labels, axis=1)

    # Drop "NO BLOCK ASSIGNMENT" entries
    voter_blocks = voter_blocks_all[~voter_blocks_all.index.str.contains("NO BLOCK ASSIGNMENT")].copy()

    # Drop Census Blocks with zero voters registered during the 2020 presidential election or ever
    voter_blocks = voter_blocks[voter_blocks["g20201103_reg_all"] > 0]
    voter_blocks = voter_blocks[voter_blocks["total_reg"] > 0]

    # Weighted mean function based on total registered voters
    wm_blocks = lambda x: (
        np.average(x.dropna(), weights=voter_blocks.loc[x.dropna().index, "total_reg"])
        if voter_blocks.loc[x.dropna().index, "total_reg"].sum() > 0
        else np.nan
    )

    # Define aggregation method for columns
    sum_cols = [*PREDICTORS_DICT["registered"], *PREDICTORS_DICT["age"], *PREDICTORS_DICT["gender"], 
                 *PREDICTORS_DICT["party"], *PREDICTORS_DICT["ethnicity"], *PREDICTORS_DICT["languages"], 
                 "g20201103_voted_all", "g20201103_reg_all"]
    agg_funcs = {col: "sum" for col in sum_cols}
    agg_funcs.update({"commercialdata_estimatedhhincomeamount_avg": wm_blocks})

    # Define block group ID
    voter_blocks["block_group_id"] = voter_blocks.index.str[:12]
    block_groups = voter_blocks.groupby("block_group_id").agg(agg_funcs)

    # Rename the income column
    block_groups = block_groups.rename({"commercialdata_estimatedhhincomeamount_avg":"mean_hh_income"}, axis=1)

    # Choose to drop NaN values for income due to low number of voters in these blocks.
    block_groups = block_groups.dropna(subset="mean_hh_income")

    # Only keep columns of interest
    block_groups["2020_turnout_pct"] = block_groups["g20201103_voted_all"] / block_groups["g20201103_reg_all"]

    # Weighted mean function based on total registered voters
    wm_bg = lambda x: (
        np.average(x.dropna(), weights=block_groups.loc[x.dropna().index, "total_reg"])
        if block_groups.loc[x.dropna().index, "total_reg"].sum() > 0
        else np.nan
    )

    # Define aggregation method for columns
    agg_funcs = {col: "sum" for col in sum_cols}
    agg_funcs.update({"mean_hh_income": wm_bg})

    # Define tract and county IDs
    block_groups["tract_id"] = block_groups.index.str[:11]
    block_groups["county_id"] = block_groups.index.str[:5]

    # Aggregate
    tracts = block_groups.groupby("tract_id").agg(agg_funcs)
    counties = block_groups.groupby("county_id").agg(agg_funcs)

    # Take proportions
    for cat in [*PREDICTORS_DICT["age"], *PREDICTORS_DICT["gender"], *PREDICTORS_DICT["party"], *PREDICTORS_DICT["ethnicity"], *PREDICTORS_DICT["languages"]]:
        block_groups[cat] = block_groups[cat] / block_groups["total_reg"]
        tracts[cat] = tracts[cat] / tracts["total_reg"]
        counties[cat] = counties[cat] / counties["total_reg"]

    # Join to shapefiles
    bg_gdf = block_groups_shp.merge(block_groups, left_on="GEOID20", right_on="block_group_id").set_index("GEOID20")
    t_gdf = tracts_shp.merge(tracts, left_on="GEOID20", right_on="tract_id").set_index("GEOID20")
    c_gdf = counties_shp.merge(counties, left_on="GEOID20", right_on="county_id").set_index("GEOID20")
    
    # Keep only relevant columns
    keep_cols = PREDICTORS + ["g20201103_voted_all","g20201103_reg_all","BASENAME", "ALAND20", "geometry"]
    bg_gdf = bg_gdf[keep_cols]
    t_gdf = t_gdf[keep_cols]
    c_gdf = c_gdf[keep_cols]

    data_dict = {"block_group":bg_gdf, "tract":t_gdf, "county":c_gdf}

    # Change variable names and calculate turnout percentage
    for name,gdf in data_dict.items():
        gdf = gdf.rename({"g20201103_voted_all": "2020_turnout", "g20201103_reg_all": "2020_registered"}, axis=1)
        gdf["2020_turnout_pct"] = gdf["2020_turnout"] / gdf["2020_registered"]
        gdf["2020_absent_pct"] = 1 - gdf["2020_turnout_pct"]
        data_dict[name] = gdf

    return data_dict

def generate_predictions(data_dict, random_state=None):
    bg_data = data_dict["block_group"]
    t_data = data_dict["tract"]
    c_data = data_dict["county"]

    X = bg_data[SUBSET_PREDICTORS]
    y = bg_data["2020_turnout_pct"]

    bg_predictions = bg_data[["2020_turnout_pct","2020_absent_pct","2020_registered","2020_turnout"]].copy()
    bg_shap = bg_data[SUBSET_PREDICTORS].copy()

    #kf = KFold(n_splits=10,shuffle=True,random_state=random_state)
    # X.loc[:,["total_reg","mean_hh_income"]] = StandardScaler().fit_transform(X=X[["total_reg","mean_hh_income"]])

    param_grid = {
        "n_estimators" : [50, 100, 200],
        "max_depth" : [10, 20, None],
        "min_samples_split" : [2, 10],
        "min_samples_leaf" : [1, 5],
        "max_features" : ["sqrt","log2"]
    }

    random_search = RandomizedSearchCV(RandomForestRegressor(
        random_state=0, 
        warm_start=False), # Set this to false for deterministic behavior
            param_grid, 
            cv=10, 
            scoring="neg_mean_squared_error",
            random_state=0,
            n_iter=5 # 5 iterations for now
        )

    random_search.fit(X, y)

    rf_cv = RandomForestRegressor(**random_search.best_params_, random_state=0)
    rf_cv.fit(X, y)
    bg_predictions.loc[X.index, "2020_turnout_pct_pred"] = rf_cv.predict(X)

    # Create SHAP explainer
    # explainer = shap.LinearExplainer(linreg, X)
    explainer = shap.TreeExplainer(rf_cv, X)
    shap_values = explainer.shap_values(X)
    bg_shap.loc[X.index, SUBSET_PREDICTORS] = shap_values
    
       
    print("SHAP base value: " + str(explainer.expected_value))
    print()
    
    # Calculate other columns
    bg_predictions["2020_absent"] = bg_predictions["2020_registered"] - bg_predictions["2020_turnout"]
    bg_predictions["2020_absent_pct_pred"] = 1 - bg_predictions["2020_turnout_pct_pred"]
    bg_predictions["2020_turnout_pred"] = (bg_predictions["2020_registered"] * bg_predictions["2020_turnout_pct_pred"]) #.round(decimals=0).astype(int)
    bg_predictions["2020_absent_pred"] = bg_predictions["2020_registered"] - bg_predictions["2020_turnout_pred"] 
    
    print("SHAP Turnout Pred: " + str(sum(bg_shap.iloc[0]) + explainer.expected_value))
    print("2020 Turnout Pct Pred: " + str(bg_predictions["2020_turnout_pct_pred"].iloc[0]))
    print("Block Groups:" + str(len(bg_shap)))
    print()

    # Aggregate to Tract
    t_predictions = bg_predictions.copy()
    t_predictions["tract_id"] = bg_predictions.index.str[:11]
    t_predictions = t_predictions.groupby("tract_id")[["2020_registered", "2020_turnout", "2020_absent", "2020_turnout_pred", "2020_absent_pred"]].sum()
    t_predictions["2020_turnout_pct_pred"] = t_predictions["2020_turnout_pred"] / t_predictions["2020_registered"]
    t_predictions["2020_absent_pct_pred"] = 1 - t_predictions["2020_turnout_pct_pred"]
    
    t_shap = bg_shap.copy()
    for i in t_shap.index:
        t_shap.loc[i,SUBSET_PREDICTORS] *= bg_predictions.loc[i,"2020_registered"]
    
    t_shap["tract_id"] = bg_shap.index.str[:11]
    t_shap = t_shap.groupby("tract_id")[SUBSET_PREDICTORS].sum()
    
    for i in t_shap.index:
        t_shap.loc[i,SUBSET_PREDICTORS] /= t_predictions.loc[i,"2020_registered"]
    
    print("SHAP Turnout Pred: " + str(sum(t_shap.iloc[0]) + explainer.expected_value))
    print("2020 Turnout Pct Pred: " + str(t_predictions["2020_turnout_pct_pred"].iloc[0]))
    print("Tracts:" + str(len(t_shap)))
    print()

    # Aggregate to County
    c_predictions = bg_predictions.copy()
    c_predictions["county_id"] = bg_predictions.index.str[:5]
    c_predictions = c_predictions.groupby("county_id")[["2020_registered", "2020_turnout", "2020_absent", "2020_turnout_pred", "2020_absent_pred"]].sum()
    c_predictions["2020_turnout_pct_pred"] = c_predictions["2020_turnout_pred"] / c_predictions["2020_registered"]
    c_predictions["2020_absent_pct_pred"] = 1 - c_predictions["2020_turnout_pct_pred"]
    
    c_shap = bg_shap.copy()
    for i in c_shap.index:
        c_shap.loc[i,SUBSET_PREDICTORS] *= bg_predictions.loc[i,"2020_registered"]
        
    c_shap["county_id"] = bg_shap.index.str[:5]
    c_shap = c_shap.groupby("county_id")[SUBSET_PREDICTORS].sum()
    
    for i in c_shap.index:
        c_shap.loc[i,SUBSET_PREDICTORS] /= c_predictions.loc[i,"2020_registered"]
    
    print("SHAP Turnout Pred: " + str(sum(c_shap.iloc[0]) + explainer.expected_value))
    print("2020 Turnout Pct Pred: " + str(c_predictions["2020_turnout_pct_pred"].iloc[0]))
    print("Counties:" + str(len(c_shap)))
    print()
    
    bg_shap = bg_shap.add_suffix("_shap")
    t_shap = t_shap.add_suffix("_shap")
    c_shap = c_shap.add_suffix("_shap")
    
    shap_exp_val = explainer.expected_value if np.isscalar(explainer.expected_value) else explainer.expected_value[0]
    bg_shap["base_value_shap"] = shap_exp_val
    t_shap["base_value_shap"] = shap_exp_val
    c_shap["base_value_shap"] = shap_exp_val

    bg_joined = bg_data.merge(bg_predictions.drop(columns=["2020_registered","2020_turnout","2020_turnout_pct","2020_absent_pct"]), left_on="GEOID20", right_on="GEOID20")
    t_joined = t_data.merge(t_predictions.drop(columns=["2020_registered","2020_turnout"]), left_index=True, right_on="tract_id").reset_index().rename({"tract_id":"GEOID20"}, axis=1).set_index("GEOID20")
    c_joined = c_data.merge(c_predictions.drop(columns=["2020_registered","2020_turnout"]), left_index=True, right_on="county_id").reset_index().rename({"county_id":"GEOID20"}, axis=1).set_index("GEOID20")
    
    bg_joined = bg_joined.merge(bg_shap, left_on="GEOID20", right_on="GEOID20")
    t_joined = t_joined.merge(t_shap, left_index=True, right_on="tract_id").reset_index().rename({"tract_id":"GEOID20"}, axis=1).set_index("GEOID20")
    c_joined = c_joined.merge(c_shap, left_index=True, right_on="county_id").reset_index().rename({"county_id":"GEOID20"}, axis=1).set_index("GEOID20")
    
    return {"block_group":bg_joined, "tract":t_joined, "county":c_joined}

def gather_plot_importance(model, title):
    # gather pred/coeff results
    importance = []
    preds = model.feature_names_in_
    if hasattr(model, "coef_"):
        importance = model.coef_
    else: 
        importance = model.feature_importances_
    importance_df = pd.DataFrame({'Predictor': preds, 'Importance':importance})

    # Visualize feature importance
    # Sort by 'Importance' to improve visualization
    importance_df = importance_df.sort_values('Importance', ascending=True).reset_index(drop=True)

    # Plot
    plt.figure(figsize=(10, 8))
    colors = importance_df['Importance'].apply(lambda x: 'green' if x > 0 else 'red')
    plt.barh(importance_df['Predictor'], importance_df['Importance'], color=colors)

    # Add titles and labels
    plt.xlabel('Importance')
    plt.ylabel('Predictor')
    plt.title('Feature Importance Plot of '+ title)

    # Display plot
    plt.grid(alpha=0.3)
    plt.show()
    return importance_df

def gather_perm_importance(model, X_train, y_train, title, n_repeats=5, random_state=None):

    results = permutation_importance(model, X_train, y_train, n_repeats=n_repeats, random_state=random_state)

    if hasattr(model, "coef_"):
        importance = model.coef_
    else: 
        importance = model.feature_importances_
    perm_imp = pd.DataFrame({
        'Predictor': X_train.columns,
        'Permutation Importance Mean': results.importances_mean,
        'Permutation Importance Std': results.importances_std, 
        'Importance': importance
    }).sort_values('Permutation Importance Mean', ascending=False)

    perm_imp = perm_imp[perm_imp['Permutation Importance Mean'] > 0]

    F = list(perm_imp['Predictor'])
    I = list(perm_imp['Permutation Importance Mean'])
    E = list(perm_imp['Permutation Importance Std'])
    B = list(perm_imp['Importance'])
    F.reverse()
    I.reverse()
    E.reverse()
    B.reverse()
    colors = ['red' if b < 0 else 'green' for b in B]

    # Plot top 10 features with error bars
    plt.figure(figsize=(10, 8))

    plt.barh(range(len(perm_imp)), I, xerr=E, capsize=5, color=colors)
    plt.yticks(range(len(perm_imp)), F)
    plt.title('Permutation Importance of Features for ' + title)
    plt.xlabel('Importance')
    plt.tight_layout()
    plt.grid(alpha=0.3)
    plt.show()

    return perm_imp

def plot_dist(data, title, column, xlabel, ylabel, annotation_format, annotation_height):
    # Create figure and axis
    fig, ax = plt.subplots(figsize=(8,6))

    # KDE plot
    sns.kdeplot(data, x=column, linewidth=3, alpha=0.75, ax=ax)

    # Calculate statistics
    median = data[column].median()
    p5 = np.percentile(data[column], 5)
    p95 = np.percentile(data[column], 95)

    # Add vertical lines for statistics
    plt.axvline(x=median, linestyle="--", color="r", linewidth=2, label="Median")
    plt.axvline(x=p5, linestyle=":", color="k", linewidth=2, label="5th percentile")
    plt.axvline(x=p95, linestyle=":", color="k", linewidth=2, label="95th percentile")

    # Annotate statistics on the plot
    y_min, y_max = ax.get_ylim()
    plt.text(median, annotation_height[1] * y_max, annotation_format.format(median), color="r", bbox={"edgecolor":"r", "facecolor":"white", "alpha":0.9}, ha="center")
    plt.text(p5, annotation_height[0] * y_max, annotation_format.format(p5), color="k", bbox={"edgecolor":"k", "facecolor":"white", "alpha":0.9}, ha="center")
    plt.text(p95, annotation_height[2] * y_max, annotation_format.format(p95), color="k", bbox={"edgecolor":"k", "facecolor":"white", "alpha":0.9}, ha="center")

    # Customize axes
    print()
    plt.xticks(ax.get_xticks(), [annotation_format.format(x) for x in ax.get_xticks()])
    plt.xlim(data[column].min(), data[column].max())
    
    # Add the custom legend to the plot
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.title(title)
    plt.legend()
    plt.grid(alpha=0.3)

    plt.show()

# Creates a scatterplot of two continuous variables
def plot_scatter(data, title, x_column, y_column, xlabel, ylabel, label_format):
    fig,ax = plt.subplots(figsize = (8,6))

    # Plot the data
    sns.scatterplot(data, x=x_column, y=y_column, alpha=0.3)

    # Add the custom legend to the plot
    plt.xlabel(xlabel)
    plt.ylabel(ylabel)
    plt.xticks(ticks=ax.get_xticks(), labels=[label_format.format(x) for x in ax.get_xticks()])
    plt.xlim(0, max(ax.get_xticks()))
    plt.grid(alpha=0.3)
    plt.title(title)
    plt.show()

# Plots voter distribution by category via kernel density
def plot_KDE(data, title, vars, labels, colors, xlabel):
    fig,ax = plt.subplots(figsize = (8,6))
    legend_elements =[]
    for i in range(len(vars)):
        sns.kdeplot(data, x=vars[i], y='2020_turnout_pct', ax=ax,
                    color=colors[i],
                        alpha=0.3,
                        label=labels[i]
                    )
        legend_elements.append(Line2D([0], [0], color=colors[i], lw=4, label=labels[i]))

    # Add the custom legend to the plot
    plt.legend(handles=legend_elements)
    plt.title(title)
    plt.xlabel(f'Proportion of {xlabel} Relative to Total Registered Voting Population')
    plt.ylabel('Voter Turnout')
    plt.grid(alpha=0.3)
    plt.show()

def plot_corr_matrix(data, title, vars):
    fig,ax = plt.subplots(figsize = (10,10))
    corr = data[vars].corr()
    mask = np.triu(np.ones_like(corr, dtype=bool))
    sns.heatmap(corr, mask=mask, cmap="RdBu")
    plt.title(title)
    plt.show()
    
if __name__ == "__main__":

    data_dict = process_data()
    # data_dict["block_group"].to_file("../data/block_groups.geojson")
    # data_dict["tract"].to_file("../data/tracts.geojson")
    # data_dict["county"].to_file("../data/counties.geojson")

    # pred_dict = generate_predictions(data_dict, random_state=209)
    # pred_dict["block_group"].to_file("../data/block_groups_pred.geojson")
    # pred_dict["tract"].to_file("../data/tracts_pred.geojson")
    # pred_dict["county"].to_file("../data/counties_pred.geojson")