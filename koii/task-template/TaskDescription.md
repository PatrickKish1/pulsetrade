# PULSE TRADE AI Koii Task - Predictive Model for Token Trading

## Overview

This project is a predictive model designed to analyze token data using the Polygon API, make predictions using **Brain.js**, and assist with trade decisions. It predicts the future value of a token and suggests whether it is a buy or sell trade. Additionally, it provides recommended values for **take profit**, **stop loss**, and **lot size** for the trade. 

The predictions and trade suggestions are sent to a **MongoDB** database, where the data is displayed at (The Pulse Trade Website)[https://pulsetrade-app.vercel.app/] for easy visualization and interaction.

## Key Features

- **Token Data Fetching**: Fetches real-time token data from the Polygon API.
- **Prediction Model**: Uses **Brain.js** to create a predictive model that forecasts token price movements.
- **Trade Decision Making**: Provides buy/sell recommendations based on the model’s predictions.
- **Trade Parameters**: Suggests key trade parameters including:
  - Take Profit Level
  - Stop Loss Level
  - Lot Size
- **MongoDB Integration**: Stores predictions and trade suggestions in a MongoDB database.
- **Frontend Display**: Displays the fetched data and recommendations at (The Pulse Trade Website)[https://pulsetrade-app.vercel.app/] for easy access. To view the predicted values connect wallet and go to the predictions page.

## How It Works

1. **Data Collection**:
   - Token data is retrieved from the Polygon API, which includes real-time price information and other relevant metrics.
   
2. **Data Processing**:
   - The retrieved token data is processed and fed into the **Brain.js** neural network model.
   - Brain.js is used to train a predictive model based on historical token price data and other factors.
   
3. **Prediction Generation**:
   - The trained model generates predictions on whether the token will go up or down in value.
   - Based on the model’s output, the system provides buy/sell recommendations and calculates suggested **take profit**, **stop loss**, and **lot size**.
   
4. **Database Storage**:
   - The generated predictions and trade suggestions are sent to a **MongoDB** database for storage.
   
5. **Frontend Display**:
   - A frontend page is used to visualize the predictions and suggested trade parameters.
   - Users can interact with the data and see the results of the predictive model.

## Technology Stack

- **KOII Nodes**: Decentralized compute for running prediction models.
- **Polygon API**: For retrieving real-time token data.
- **Brain.js**: A JavaScript library for neural networks used to make predictions.
- **MongoDB**: For storing prediction results and trade suggestions.
- **Frontend**: A web interface to display data and interact with predictions.


