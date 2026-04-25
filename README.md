# VidSnap – YouTube & Instagram Downloader

## Phone se Setup Guide (Step by Step)

---

### STEP 1 – GitHub pe Repository banao

1. Phone mein **github.com** kholo
2. "New Repository" pe click karo
3. Name rakho: `vidsnap`
4. "Create Repository" karo

---

### STEP 2 – Files Upload karo

In files ko GitHub repo mein upload karo:

```
vidsnap/
├── server.js
├── package.json
├── nixpacks.toml
└── public/
    └── index.html
```

1. GitHub repo mein jao
2. "Add file" → "Upload files" karo
3. Pehle `server.js`, `package.json`, `nixpacks.toml` upload karo
4. Phir `public` folder banao aur `index.html` upload karo

---

### STEP 3 – Railway pe Deploy karo (FREE)

1. **railway.app** kholo phone mein
2. "Start a New Project" karo
3. "Deploy from GitHub repo" select karo
4. Apni `vidsnap` repo select karo
5. Deploy automatically shuru ho jayega ✅

---

### STEP 4 – Railway URL lao

1. Railway dashboard mein jao
2. Apne project pe click karo
3. "Settings" → "Domains" mein jao
4. "Generate Domain" pe click karo
5. URL copy karo (example: `https://vidsnap-production.railway.app`)

---

### STEP 5 – Frontend mein URL lagao

1. Apne browser mein `public/index.html` kholo
   (Ya directly Railway ka URL kholo — woh bhi frontend serve karta hai!)
2. Upar "API URL" box mein Railway URL paste karo
3. "Save" karo

---

### Done! 🎉

Ab koi bhi YouTube ya Instagram link paste karo aur download karo!

---

## Problems aaye toh

- Railway logs check karo Dashboard mein
- `yt-dlp` update ho jaata hai, isliye kabhi kabhi kaam nahi karta
- Instagram private videos download nahi hoti
