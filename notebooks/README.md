# Next-Day PM2.5 Prediction and Air Quality Analysis Across Indian Cities

An empirical machine-learning study of next-day PM2.5 concentration prediction and high-PM2.5-day classification using historical air-quality observations from Indian cities.

<p align="center">
  <a href="https://kavyasoni7022.github.io/PM25_project/">
    <strong>View Interactive Project Website</strong>
  </a>
  &nbsp; | &nbsp;
  <a href="https://github.com/kavyasoni7022/PM25_project">
    <strong>View GitHub Repository</strong>
  </a>
</p>

---

## 1. Project Overview

Air pollution is an important environmental concern, particularly in urban areas where pollutant concentrations can vary over time and across locations. PM2.5 (fine particulate matter with an aerodynamic diameter of 2.5 micrometres or smaller) is one of the important indicators used to study ambient air quality.

This project investigates whether historical air-quality measurements and recent temporal patterns can be used to predict next-day PM2.5 concentration and identify days when PM2.5 exceeds a specified threshold.

The study uses historical daily air-quality observations from Indian cities and applies supervised machine-learning techniques to two related prediction problems.

### 1.1 Research Question

**How effectively can historical and current-day air-pollution measurements predict next-day PM2.5 concentration and identify high-PM2.5 conditions across Indian cities?**

### 1.2 Project Objectives

- Explore and understand historical air-quality data.
- Examine missing observations and temporal coverage across cities.
- Prepare a consistent daily dataset for modelling.
- Construct temporal features using historical PM2.5 measurements.
- Develop regression models for next-day PM2.5 prediction.
- Develop a classification model for identifying next-day PM2.5 threshold exceedances.
- Compare machine-learning models against simple baseline methods.
- Evaluate models using chronological validation and test periods.
- Analyse prediction errors across cities, months and different test-period conditions.
- Examine regression performance on cities not included in pooled model development.

### 1.3 Two Prediction Tasks

| Task | Objective | Target |
|---|---|---|
| Regression | Estimate next-day PM2.5 concentration | Continuous PM2.5 value in µg/m³ |
| Classification | Identify next-day PM2.5 threshold exceedance | 1 if PM2.5 > 90 µg/m³, otherwise 0 |

The threshold of 90 µg/m³ is a project-defined experimental threshold. It is not presented as a universal or official classification of poor air quality.

### 1.4 Prediction Setup

The project follows a one-day-ahead forecasting setup.

For a city on date *t*, the available current-day and historical measurements are used to predict PM2.5 on date *t + 1*.

The model does not use the next day's actual PM2.5 value as an input feature.

---

## 2. Dataset Description

### 2.1 Data Source

The project uses the dataset:

**Air Quality Data in India (2015–2020)**

- Dataset platform: Kaggle
- Dataset compiler/uploader: `rohanrao`
- Original data file: `city_day.csv`
- Underlying observations: attributed to the Central Pollution Control Board (CPCB), India, in the project documentation.

**Original dataset:**  
https://www.kaggle.com/datasets/rohanrao/air-quality-data-in-india

The original dataset contains daily air-quality observations for multiple Indian cities.

### 2.2 Dataset Structure

The original dataset contains:

- 29,531 observations.
- 16 variables.
- One row representing one city on one observation date.

The variables include:

| Variable | Description / Role |
|---|---|
| City | City identifier |
| Date | Observation date |
| PM2.5 | Primary pollutant of interest |
| PM10 | Particulate matter measurement |
| NO | Nitric oxide measurement |
| NO2 | Nitrogen dioxide measurement |
| NOx | Nitrogen oxides measurement |
| NH3 | Ammonia measurement |
| CO | Carbon monoxide measurement |
| SO2 | Sulphur dioxide measurement |
| O3 | Ozone measurement |
| Benzene | Benzene measurement |
| Toluene | Toluene measurement |
| Xylene | Xylene measurement |
| AQI | Air Quality Index |
| AQI_Bucket | Air-quality category |

PM2.5 is the primary target source. Its following-day value is used for regression and to derive the binary classification target.

AQI and AQI_Bucket are excluded from the selected modelling predictors.

### 2.3 Dataset Preparation

The original data was restricted to selected cities and organised into a common daily city-date structure.

| Processing stage | Number of rows |
|---|---:|
| Original dataset | 29,531 |
| Prepared six-city daily dataset | 12,054 |
| Final model-ready dataset | 11,037 |

The prepared dataset contains 2,009 daily positions for each of the six selected cities.

The model-ready dataset is created after feature construction, next-day target generation and eligibility checks.

### 2.4 Missing-Value Analysis

Missingness was examined after daily reindexing of the selected cities.

Selected missing-value statistics:

| Variable | Missing observations | Missing percentage |
|---|---:|---:|
| PM2.5 | 957 | 7.94% |
| PM10 | 6,329 | 52.51% |
| NH3 | 3,859 | 32.01% |
| Xylene | 7,261 | 60.24% |
| Benzene | 1,103 | 9.15% |
| Toluene | 936 | 7.77% |

Missingness varies considerably between pollutant variables.

Xylene and PM10 have substantial missingness and were excluded from the selected modelling predictors.

NH3 was retained despite its missingness and handled during preprocessing.

Missing PM2.5 target observations were not artificially imputed. Samples without an available next-day target were excluded from supervised model training or evaluation.

**Important distinction:** The 957 missing PM2.5 observations describe missing values in the prepared daily dataset. They are not the same as the number of rows that become ineligible after next-day target construction.

---

## 3. City Selection and Coverage Analysis

City selection was based on the availability of PM2.5 observations during the model-development periods.

The initial screening criterion required at least 70% PM2.5 coverage separately in:

- Training period: 2015–2018.
- Validation period: 2019.

### 3.1 City Coverage Screening

| City | Training coverage | Validation coverage | Screening result |
|---|---:|---:|---|
| Delhi | 99.9% | 100.0% | Passed |
| Lucknow | 93.0% | 100.0% | Passed |
| Chennai | 92.0% | 100.0% | Passed |
| Hyderabad | 91.9% | 100.0% | Passed |
| Bengaluru | 90.0% | 100.0% | Passed |
| Patna | 67.8% | 99.7% | Below threshold |
| Gurugram | 66.9% | 100.0% | Below threshold |
| Ahmedabad | 57.5% | 98.4% | Below threshold |
| Visakhapatnam | 47.8% | 96.7% | Below threshold |

### 3.2 Why Was Patna Retained?

Five cities satisfied the 70% coverage requirement in both periods.

However, the project proceeded with a six-city pooled dataset.

Patna was retained as the additional city because:

- Its training coverage was 67.8%, which was closest to the 70% cutoff among the remaining candidates.
- Its validation coverage was 99.7%.

Patna is therefore an explicit exception to the initial screening criterion. It should not be interpreted as a city that passed the 70% requirement.

### 3.3 Final Selected Cities

The pooled model-development dataset contains:

1. Bengaluru
2. Chennai
3. Delhi
4. Hyderabad
5. Lucknow
6. Patna

Each city's timeline contains 2,009 daily positions, producing 12,054 rows in the prepared dataset.

### 3.4 Unseen Cities

Mumbai and Guwahati were kept separate from the six-city pooled model-development dataset.

They were used in an additional evaluation to examine how the selected regression model performs on cities not included in pooled development.

---

## 4. Data Preprocessing and Feature Engineering

The project transforms the original city-day observations into a daily forecasting dataset.

### 4.1 Daily Time-Series Preparation

The observations were organised into city-specific daily time series.

Daily date indexing allows temporal features to be constructed consistently.

Missing dates introduced during daily reindexing were retained as missing observations rather than being treated as measured pollutant values.

### 4.2 Next-Day Target Construction

For each city, PM2.5 was shifted forward by one day.

A feature record for city *c* on date *t* is associated with the PM2.5 measurement for the same city on date *t + 1*.

Records without an available next-day target were not eligible for supervised modelling.

### 4.3 Temporal Feature Engineering

The selected temporal features include:

**PM2.5 lag features**

| Feature | Meaning |
|---|---|
| Lag 1 | PM2.5 from the previous day |
| Lag 2 | PM2.5 from two days earlier |
| Lag 3 | PM2.5 from three days earlier |
| Lag 7 | PM2.5 from seven days earlier |

**Rolling-average features**

- Three-day rolling mean of PM2.5.
- Seven-day rolling mean of PM2.5.

These features represent recent pollution conditions over different time windows.

### 4.4 Selected Predictor Variables

The final selected feature set includes:

**Current PM2.5 and temporal features**
- PM2.5
- Lag 1
- Lag 2
- Lag 3
- Lag 7
- Rolling mean 3
- Rolling mean 7

**Other pollutant measurements**
- NO
- NO2
- NOx
- NH3
- CO
- SO2
- O3
- Benzene
- Toluene

**Categorical feature**
- City

PM10 and Xylene were excluded because of substantial missingness.

AQI and AQI_Bucket were excluded from the selected predictor set to avoid using these air-quality summary variables as inputs to the PM2.5 forecasting task.

### 4.5 Missing-Value Handling

Missing numerical predictor values were handled using median imputation.

Median imputation provides a robust summary-based replacement and is less sensitive to extreme values than mean imputation.

Missing target values were not imputed because doing so would create artificial values for the quantity being predicted.

### 4.6 Scaling and Categorical Encoding

- Numerical predictors were standardised using training-data statistics.
- City was transformed using one-hot encoding.
- Unseen categorical values were handled through the configured unknown-category behaviour.

### 4.7 Preventing Preprocessing Leakage

Preprocessing transformations were fitted using training data only.

This includes:

- Numerical median imputation.
- Numerical standardisation.
- Categorical encoding.

The fitted transformations were then applied to validation and test observations.

This prevents information from later evaluation periods from influencing preprocessing parameters during model development.

---

## 5. Experimental Design and Chronological Evaluation

Since the project focuses on next-day forecasting, random distribution of observations across training, validation and test sets would not represent the intended forecasting setting.

The project therefore uses chronological splitting based on target dates.

### 5.1 Exact Data Split

| Dataset | Target-date range | Eligible observations | Purpose |
|---|---|---:|---|
| Training | 2 Jan 2015 – 31 Dec 2018 | 7,751 | Model fitting |
| Validation | 1 Jan 2019 – 31 Dec 2019 | 2,188 | Model comparison and selection |
| Test | 1 Jan 2020 – 1 Jul 2020 | 1,098 | Final evaluation |

### 5.2 Role of Each Split

**Training set**

Used to fit candidate models and preprocessing transformations.

**Validation set**

Used to compare candidate models and make model-selection decisions.

**Test set**

Reserved for final evaluation of the selected models.

The test period was not used for model selection or hyperparameter tuning.

### 5.3 Why Chronological Splitting Matters

A forecasting model should be developed using past information and evaluated on later observations.

Keeping the test period separate helps ensure that reported test metrics represent performance on held-out future observations rather than observations already used for model selection.

---

## 6. Regression: Next-Day PM2.5 Prediction

The regression task estimates the numerical PM2.5 concentration for the following day.

The target is expressed in µg/m³.

### 6.1 Regression Baselines

Two time-based baselines were used.

**Persistence baseline**

Predicts the next day's PM2.5 using the current day's PM2.5 measurement.

This provides a simple reference because recent pollution levels may carry useful information about the following day.

**Seven-day mean baseline**

Uses the average PM2.5 concentration over the previous seven days to predict the next-day value.

This provides a smoothed reference based on recent pollution history.

### 6.2 Candidate Regression Models

The following models were investigated:

| Model | Approach |
|---|---|
| Ordinary Least Squares (OLS) | Linear regression |
| Ridge Regression | L2-regularised linear regression |
| Lasso Regression | L1-regularised linear regression |
| Support Vector Regression (SVR) | RBF-kernel nonlinear regression |
| Random Forest Regression | Tree-based ensemble |
| Histogram-Based Gradient Boosting | Gradient-boosted tree model |

These candidates allow comparison between linear, regularised linear and nonlinear modelling approaches.

### 6.3 Evaluation Metrics

**Mean Absolute Error (MAE)**

MAE measures the average absolute difference between actual and predicted PM2.5 values.

It is expressed in the original PM2.5 measurement units and was used as the primary regression model-selection metric.

**Root Mean Squared Error (RMSE)**

RMSE measures the square root of the average squared prediction error.

Because errors are squared before averaging, larger prediction errors have a stronger influence on RMSE.

Both metrics were reported to provide complementary information about regression performance.

### 6.4 Validation-Based Model Selection

Model selection was performed using the validation dataset.

| Model | Validation MAE |
|---|---:|
| Persistence baseline | 16.3761 |
| SVR (RBF) | 15.6688 |
| Random Forest | 15.8567 |

SVR with an RBF kernel achieved the lowest validation MAE among the compared approaches.

Its validation MAE was approximately 4.32% lower than the persistence baseline.

Random Forest was a close alternative, with a slightly lower validation RMSE than SVR. However, SVR was selected based on its lower validation MAE, the primary selection metric.

### 6.5 Final Selected Regression Model

**Support Vector Regression with an RBF kernel**

Selected hyperparameters:

| Parameter | Value |
|---|---:|
| C | 100 |
| Gamma | 0.01 |
| Epsilon | 0.1 |

The test set was not used to select this model or tune its hyperparameters.

### 6.6 Final Test Results

| Model | Test MAE (µg/m³) | Test RMSE (µg/m³) |
|---|---:|---:|
| SVR (RBF) | 11.4550 | 18.6468 |
| Persistence baseline | 11.6316 | 19.4390 |
| Seven-day mean baseline | 14.1057 | 22.4793 |

SVR achieved approximately 1.52% lower test MAE than the persistence baseline.

The improvement is modest. Although the selected machine-learning model performed better than persistence, the results show that a simple time-based forecast remains a strong reference for this task.

---

## 7. Classification: Identifying High-PM2.5 Days

The classification task converts next-day PM2.5 prediction into a binary prediction problem.

### 7.1 Target Definition

The positive class is defined as:

- Class 1: Next-day PM2.5 > 90 µg/m³.
- Class 0: Next-day PM2.5 ≤ 90 µg/m³.

The 90 µg/m³ threshold is a project-defined experimental threshold.

### 7.2 Classification Baseline

A current-day threshold baseline was used as a simple reference.

It applies the same 90 µg/m³ threshold to the current day's PM2.5 measurement to predict whether the following day will exceed the threshold.

### 7.3 Classifier Selection

Logistic Regression was selected based on validation performance.

It achieved the highest validation Precision–Recall Area Under the Curve (PR-AUC):

**Validation PR-AUC: 0.9239515**

PR-AUC evaluates the precision–recall relationship across different classification thresholds and is useful for assessing positive-class identification.

### 7.4 Operating Threshold

The selected probability threshold was 0.40.

Logistic Regression produces a probability for the positive class. The operating threshold determines when a prediction is classified as positive.

A lower threshold generally favours recall, while a higher threshold generally favours precision.

The threshold was selected using validation data. The held-out test set remained separate from this decision.

### 7.5 Final Classification Test Results

| Metric | Test score |
|---|---:|
| Accuracy | 0.9399 |
| Precision | 0.7429 |
| Recall | 0.8609 |
| F1-score | 0.7975 |
| PR-AUC | 0.8652 |

The classifier achieved a recall of approximately 0.861, indicating that it identified a large proportion of actual threshold-exceedance days.

Its precision of approximately 0.743 indicates that some predicted exceedance days did not correspond to actual exceedances.

### 7.6 Confusion Matrix

| Actual / Predicted | Predicted non-exceedance | Predicted exceedance |
|---|---:|---:|
| Actual non-exceedance | 902 | 45 |
| Actual exceedance | 21 | 130 |

Interpretation:

- True negatives: 902
- False positives: 45
- False negatives: 21
- True positives: 130

The classifier identified most exceedance days, while producing some false alarms.

---

## 8. Error Analysis

Aggregate evaluation metrics do not explain every prediction.

The project therefore examines regression errors across:

- Individual cities.
- Different months.
- Pre-lockdown and lockdown periods.
- The largest individual prediction deviations.

### 8.1 City-Wise and Monthly Errors

The city-wise and monthly breakdowns show that prediction performance is not uniform across locations and dates.

The largest prediction errors were concentrated particularly in January 2020.

Delhi, Lucknow and Patna appeared among the cities with notable deviations.

### 8.2 Pre-Lockdown and Lockdown Comparison

The test period was divided using 25 March 2020 as the boundary.

| Period | SVR MAE (µg/m³) | Persistence MAE (µg/m³) |
|---|---:|---:|
| Pre-lockdown | 15.68 | 16.09 |
| Lockdown | 7.87 | 7.85 |

Before the lockdown period, SVR achieved slightly lower MAE than persistence.

During the lockdown period, the two methods had nearly identical MAE.

These are descriptive observations from the test data. They do not establish that lockdown conditions caused changes in model performance.

### 8.3 Why Error Analysis Matters

Examining errors across cities, months and periods helps identify where predictions are less reliable.

It also demonstrates why evaluation should consider the distribution of errors rather than relying only on a single aggregate metric.

---

## 9. Generalisation to Unseen Cities

The selected regression model was evaluated separately on two cities that were not included in the pooled model-development dataset.

The cities were:

- Mumbai
- Guwahati

### 9.1 Combined Unseen-City Evaluation

| Model / Evaluation | MAE (µg/m³) | RMSE (µg/m³) |
|---|---:|---:|
| SVR (364 observations) | 12.1070 | 21.5404 |
| Persistence (358 comparable observations) | 11.9959 | 22.9068 |

The evaluation sample counts differ, so the two MAE values should not be treated as a strictly like-for-like comparison.

### 9.2 City-Wise SVR Results

| City | Observations | MAE (µg/m³) | RMSE (µg/m³) |
|---|---:|---:|---:|
| Guwahati | 181 | 16.9246 | 28.4656 |
| Mumbai | 183 | 7.7922 | 11.7120 |

Performance varied between the two unseen cities.

This indicates that results obtained from the six pooled development cities should not automatically be assumed to transfer uniformly to other Indian cities.

The unseen-city evaluation is a separate generalisation experiment, not part of the main chronological test evaluation.

---

## 10. Model Interpretation

The project includes feature-importance and coefficient analyses to provide additional context about model behaviour.

### 10.1 Random Forest Feature Importance

Tree-based feature importance is used to examine which predictors contribute to the Random Forest model's predictive behaviour.

### 10.2 Lasso Coefficients

Lasso coefficients provide an additional view of the direction and magnitude of relationships learned by the regularised linear model.

### 10.3 Interpretation Caveat

Feature importance and model coefficients describe model behaviour.

They do not establish causal relationships between pollutant variables.

---

## 11. Limitations

The results should be interpreted within the boundaries of the dataset and experimental design.

### 11.1 Missing Observations

Several pollutant variables contain substantial missingness.

This affects feature availability and city coverage.

### 11.2 Limited Test Horizon

The pooled test period covers 1 January 2020 to 1 July 2020.

It does not cover the later crop-burning season.

### 11.3 Modest Regression Improvement

SVR achieved a test MAE of 11.4550 µg/m³ compared with 11.6316 µg/m³ for persistence.

The improvement is approximately 1.52%, indicating that the selected machine-learning model provides only a modest improvement over the simple time-based baseline.

### 11.4 Classification Threshold Trade-Off

At the selected probability threshold of 0.40, the classifier achieved:

- Recall: 0.8609
- Precision: 0.7429

Different operating thresholds could produce different precision and recall values.

### 11.5 City Generalisation

Only two unseen cities, Mumbai and Guwahati, were examined.

These results are not sufficient to establish generalisation across all Indian cities.

### 11.6 Limited Predictor Information

The selected predictors primarily describe pollutant measurements and recent temporal patterns.

The experiments do not incorporate additional meteorological information such as:

- Wind speed.
- Temperature.
- Rainfall.

These variables could provide further context about atmospheric conditions.

### 11.7 Historical Evaluation Period

The held-out test period covers January to July 2020.

Performance during this historical period may not represent other seasons or more recent pollution patterns.

### 11.8 Prediction Rather Than Causation

Statistical relationships learned by the models should not be interpreted as evidence of causal effects between pollutants.

---

## 12. Conclusion

This project evaluates next-day PM2.5 regression and high-PM2.5-day classification using a chronological machine-learning workflow.

The final regression model, RBF-kernel SVR, achieved a test MAE of 11.4550 µg/m³ compared with 11.6316 µg/m³ for the persistence baseline.

This represents a modest improvement and demonstrates that recent pollutant measurements and temporal features provide some additional predictive value, but do not substantially outperform a simple time-based forecast.

For classification, Logistic Regression achieved a test recall of 0.8609 and precision of 0.7429 at the selected probability threshold of 0.40.

The unseen-city evaluation on Mumbai and Guwahati showed that performance can vary across cities. Therefore, results from the six development cities should not be assumed to transfer uniformly to other locations.

Overall, the project demonstrates the importance of:

- Chronological validation.
- Comparison against simple baselines.
- Careful feature engineering.
- Separate model-selection and test periods.
- Detailed error analysis.
- Transparent reporting of limitations.

---

## 13. Repository Structure

```text
PM25_project/
│
├── README.md
│
├── index.html
├── style.css
├── app.js
├── data.js
│
└── notebooks/
    │
    ├── README.md
    ├── 01_data_understanding.ipynb
    ├── 02_features_baselines.ipynb
    ├── 03_modeling.ipynb
    ├── 04_test_and_errors.ipynb
    ├── 05_export.ipynb
    └── 06_final_visualizations.ipynb
```

### Website Files

| File | Purpose |
|---|---|
| `index.html` | Website structure and project content |
| `style.css` | Website styling and responsive layout |
| `app.js` | Website interactions and chart rendering |
| `data.js` | Curated experimental results and visualisation data |

### Notebook Files

| Notebook | Purpose |
|---|---|
| `01_data_understanding.ipynb` | Exploratory data analysis, missingness and city coverage |
| `02_features_baselines.ipynb` | Data preparation, feature engineering and baseline construction |
| `03_modeling.ipynb` | Candidate model training and validation-based model selection |
| `04_test_and_errors.ipynb` | Held-out test evaluation, error analysis and unseen-city evaluation |
| `05_export.ipynb` | Exporting curated project results |
| `06_final_visualizations.ipynb` | Preparing final project visualisations |

---

## 14. Reproducibility

The repository contains the project website and six Jupyter notebooks documenting the analysis and modelling workflow.

### 14.1 Obtain the Dataset

Download the original `city_day.csv` dataset from:

https://www.kaggle.com/datasets/rohanrao/air-quality-data-in-india

The raw dataset and prepared CSV files are not redistributed through this repository.

### 14.2 Open the Notebooks

The notebooks can be opened using Google Colab or a local Jupyter Notebook environment.

Execute the notebooks in numerical order, beginning with data understanding and continuing through feature engineering, modelling, test evaluation, export and visualisation.
Before running the notebooks in Google Colab:

1. Upload the downloaded `city_day.csv` file to your Google Drive.
2. Create a folder named `PM25_project` in `MyDrive`.
3. Inside it, create a folder named `data`.
4. Place `city_day.csv` inside the `data` folder.

The expected file path is:

`/content/drive/MyDrive/PM25_project/data/city_day.csv`

Mount Google Drive in Colab before executing the data-loading cells.

### 14.3 Maintain the Experimental Setup

Use the same chronological split:

- Training: 2 January 2015 – 31 December 2018.
- Validation: 1 January 2019 – 31 December 2019.
- Testing: 1 January 2020 – 1 July 2020.

Do not use test observations for model selection or hyperparameter tuning.

### 14.4 Final Model Configuration

The final regression model is an RBF-kernel Support Vector Regressor with:

- C = 100
- Gamma = 0.01
- Epsilon = 0.1

The final classification model is Logistic Regression with a probability threshold of 0.40.

### 14.5 Inspect the Outputs

The workflow produces prepared datasets, evaluation metrics, prediction files, plots and experiment summaries.

Compare reproduced outputs with the reported website results while accounting for possible differences in software versions and execution environments.

---

## 15. Interactive Project Website

The interactive website presents the project through the following sections:

1. Research Overview
2. Dataset and Coverage
3. Experimental Design
4. Model Evaluation
5. Regression
6. Classification
7. Error Analysis
8. Generalisation
9. Model Interpretation
10. Limitations
11. Conclusion
12. Reproducibility

It also includes interactive charts, city-wise prediction exploration, model comparisons, confusion-matrix visualisation and threshold analysis.

**Live website:**  
https://kavyasoni7022.github.io/PM25_project/

---

## 16. Acknowledgement and Data Citation

The project uses the *Air Quality Data in India (2015–2020)* dataset compiled by `rohanrao` and hosted on Kaggle.

Dataset link:

https://www.kaggle.com/datasets/rohanrao/air-quality-data-in-india

The underlying air-quality observations are attributed to the Central Pollution Control Board (CPCB), India, as stated in the project documentation.

---

*This project was developed as an academic machine-learning study of air-quality prediction using historical observations from Indian cities.*
