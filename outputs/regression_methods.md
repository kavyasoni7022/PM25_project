
# Regression Methods and Baselines

## 1. Persistence Baseline
Core idea: Predict tomorrow's PM2.5 using today's PM2.5 value.
Assumptions: Today's pollution level is a useful indicator of tomorrow's level.
Why included: It is a simple reference point that every machine learning model should try to outperform.

## 2. 7-Day Mean Baseline
Core idea: Predict tomorrow's PM2.5 using the average PM2.5 of the previous seven days.
Assumptions: Recent average pollution represents the near-future pollution level.
Why included: It provides a simple way to compare short-term averaging against persistence.

## 3. Ordinary Least Squares (OLS)
Core idea: Fits a linear relationship between input features and next-day PM2.5 by minimizing squared prediction errors.
Assumptions: The relationship between features and the target is approximately linear.
Why included: It provides an interpretable linear benchmark for understanding how current pollution and other pollutants relate to the prediction.

## 4. Ridge Regression
Core idea: Linear regression with an L2 penalty that discourages excessively large coefficients.
Assumptions: The relationship is approximately linear; regularization helps when input features are correlated.
Why included: Pollutant measurements can be correlated, so Ridge can reduce coefficient instability and overfitting.

## 5. Lasso Regression
Core idea: Linear regression with an L1 penalty that can shrink some coefficients to zero.
Assumptions: A relatively small subset of features may explain much of the target variation.
Why included: It performs regularization and can provide a simpler feature representation.

## 6. Support Vector Regression (SVR - RBF)
Core idea: Uses an RBF kernel to learn nonlinear relationships while controlling prediction errors within an epsilon-insensitive margin.
Assumptions: Similar observations in feature space tend to have related target values; the relationship need not be linear.
Why included: It can capture nonlinear pollution patterns that linear regression may miss.

## 7. Random Forest Regression
Core idea: Combines predictions from many decision trees trained on different samples and feature subsets.
Assumptions: Useful patterns can be represented through decision-tree splits; a linear relationship is not required.
Why included: It captures nonlinear relationships and feature interactions and provides a feature-importance estimate.

## 8. Histogram-Based Gradient Boosting
Core idea: Builds decision trees sequentially, with each new tree correcting errors made by the previous ensemble.
Assumptions: The target contains patterns that can be learned through successive tree-based improvements.
Why included: It provides an efficient nonlinear boosting method for tabular data.
