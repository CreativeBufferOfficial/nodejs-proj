export const last24hrTransactionsVolumeHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Transaction Volume Exceeds 250K USD</title>
</head>
<body>
  <div style="max-width: 90%;margin: auto;">
    <p>Alert for {{companyName}} has reachedn<b>$250K</b> in <b>Approved</b> transaction volume.</p>
    <p>Attached CSV is the last 24 hour transactions.</p>
    <p>Sender: {{sender}}</p>
  </div>
</body>
</html>`;