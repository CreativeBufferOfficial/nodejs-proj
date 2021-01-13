export const riskTolerancePercentageAlertHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Rejected Transactions Percentage Alert</title>
</head>
<body>
  <div style="max-width: 90%;margin: auto;">
  <p>Dear Merchant,</p>
  <br>
  <p>Customer <b>{{companyName}}</b> has reached <b>{{declinedPercentage}}</b> rate of rejected transactions within 24 a hour period. Please ensure that your users are not passing fraudulent transactions. If declined transactions exceed 30% we will systematically pause your service.<p>

  <p> Regards, FXR Finance Team</p>
  </div>
</body>
</html>`;