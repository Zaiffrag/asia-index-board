# Asia Index Board

Today's movement for STI, Hang Seng, SET, Jakarta Composite, Nikkei 225, KOSPI and KLCI.

- `index.html` is the page. It refreshes every minute.
- `netlify/functions/indices.mjs` fetches the data from Yahoo Finance (about 15 minutes delayed) and serves it at `/api/indices`.

Hosted free on Netlify. Every change pushed to `main` redeploys automatically.
