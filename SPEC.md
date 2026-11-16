# PM2.5 Next-Day Forecasting — Project Specification

## 1. Project Overview

### Objective

Develop machine-learning models to predict next-day PM2.5 concentration
using historical air-quality measurements and pollutant-related features.

The prediction is made at the end of the current day using information
available up to that day.

### Problem Type

This project investigates two related tasks:

1. Regression: predict the next day's PM2.5 concentration.
2. Classification: predict whether the next day's PM2.5 concentration
   exceeds 90 µg/m³.

The classification threshold of 90 µg/m³ is a project-defined threshold,
not a claim that it represents every possible air-quality standard.

## 2. Dataset

The project uses the city-day air-quality dataset.

- Original dataset: city_day.csv
- Observations are organized by city and date.
- PM2.5 is the primary pollutant of interest.
- The dataset contains additional pollutant measurements.

The original dataset is retained privately in Google Drive and is not
included in the public GitHub repository.

## 3. Prediction Targets

### Regression Target

PM2.5_next_day: PM2.5 concentration on the day following the input date.

### Classification Target

A binary target is defined as:

- Class 0: next-day PM2.5 <= 90 µg/m³
- Class 1: next-day PM2.5 > 90 µg/m³

## 4. Data Preparation and Feature Engineering

The planned preparation process includes:

- Date parsing and chronological ordering.
- City-wise time-series processing.
- Missing-date handling and missing-value analysis.
- Construction of lagged PM2.5 features.
- Construction of rolling PM2.5 statistics.
- Use of pollutant measurements as explanatory features.
- Exclusion of AQI and AQI_Bucket to avoid target leakage.
- Missing-value imputation using training data.
- Encoding of categorical variables where required.

### Feature Set

The final modeling feature set includes:

- PM2.5
- PM2.5_lag_1
- PM2.5_lag_2
- PM2.5_lag_3
- PM2.5_lag_7
- PM2.5_roll_mean_3
- PM2.5_roll_mean_7
- NO
- NO2
- NOx
- NH3
- CO
- SO2
- O3
- Benzene
- Toluene

City is used as a categorical feature for pooled-city modeling.
It is excluded from the dedicated unseen-city evaluation.

## 5. City Selection and Evaluation Groups

The pooled modeling group consists of:

- Delhi
- Lucknow
- Chennai
- Hyderabad
- Bengaluru
- Patna

Mumbai and Guwahati are reserved as held-out cities for evaluating
generalization to cities not used during pooled model training.

The city selection and coverage decisions are documented in the
project's data-preparation work.

## 6. Chronological Data Splitting

Data is divided chronologically using the target date to prevent
future information from entering model training.

- Training: target dates in 2015–2018.
- Validation: target dates in 2019.
- Test: target dates in January–July 2020.

The test period is further examined in relation to the lockdown
cutoff of 25 March 2020.

The test set is reserved for final evaluation and is not used for
model selection or hyperparameter tuning.

## 7. Baseline Models

Regression baselines:

1. Persistence baseline: use current-day PM2.5 as the next-day prediction.
2. Seven-day mean baseline: use the recent seven-day PM2.5 mean.

Classification baseline:

- Apply the 90 µg/m³ threshold to current-day PM2.5.

Baseline comparisons use comparable rows wherever required.

## 8. Candidate Modeling Approaches

### Regression

The planned candidate approaches include:

- Ordinary Least Squares
- Ridge Regression
- Lasso Regression
- Support Vector Regression
- Random Forest Regression
- Histogram-based Gradient Boosting Regression

### Classification

The planned candidate approaches include:

- Logistic Regression
- Linear Support Vector Classification
- Random Forest Classification

These are candidate methods. The final model choices are determined
by validation performance, not assumed in advance.

## 9. Model Selection

Regression models are compared using validation data.

Primary metric:

- Mean Absolute Error (MAE)

Additional metrics:

- Root Mean Squared Error (RMSE)
- Skill relative to the persistence baseline

Classification models are compared using validation data.

Metrics:

- Precision
- Recall
- F1-score
- Precision-Recall AUC
- Confusion matrix

The classification operating threshold is selected using validation
data and fixed before final test evaluation.

Preprocessing and hyperparameter tuning must be fitted using training
data only, with chronological validation procedures.

## 10. Final Evaluation

After model selection:

- Refit the selected regression model using training and validation data.
- Refit the selected classifier using training and validation data.
- Evaluate each final model on the reserved test set.
- Compare regression predictions with the persistence and seven-day
  mean baselines.
- Report performance for the full test period and the pre-lockdown
  and lockdown portions.
- Evaluate generalization to Mumbai and Guwahati using a model trained
  on pooled training cities without a City feature.
- Compare unseen-city predictions against persistence on the same rows.

Test results must not be used to revise model selection or thresholds.

## 11. Reproducibility and Project Outputs

The completed project is organized into:

- notebooks/: data understanding, feature engineering, modeling,
  and final testing.
- outputs/: validation results, final test predictions, evaluation
  metrics, and supporting reports.
- figures/: exploratory and model-evaluation visualizations.
- models/: saved final fitted regression and classification models.
- README.md: project overview, methodology, results, and limitations.
- requirements.txt: Python dependencies.

Raw and prepared datasets are excluded from the public repository
to protect data privacy and avoid uploading large intermediate files.

The notebooks, saved models, evaluation outputs, and dependency list
support reproducibility. The original dataset must be obtained
separately to reproduce the complete workflow.

## 12. Experiment Tracking and Transparency

Candidate models, preprocessing choices, hyperparameters, and
validation results are recorded in the project outputs.

Final model choices and test results are reported separately from
the original project plan.

The final test results are not used to claim that a model was
known to be the best before experimentation.

## 13. Privacy

The original raw dataset and other private or unnecessarily large
data files are not uploaded to the public GitHub repository.
