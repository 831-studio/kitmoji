# Kitmoji 😊

A modern, fast, and developer-friendly emoji website that's better than Emojipedia. Built with React, TypeScript, and SQLite.

## Features

✨ **Fast Search** - Find emojis instantly by name or keywords  
🏷️ **Category Filtering** - Browse emojis by category  
📋 **One-Click Copy** - Click any emoji to copy it to clipboard  
👨‍💻 **Developer Tools** - Dedicated developer page with Unicode values  
📱 **Mobile Responsive** - Works perfectly on all devices  
🎨 **Modern Design** - Beautiful gradients and smooth animations  
🗄️ **SQLite Database** - Easy to update and manage emoji data  

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Database
```bash
npm run setup-db
```

### 3. Start Development Server
```bash
npm run dev
```

The app will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Project Structure

```
kitmoji/
├── src/
│   ├── components/          # Reusable React components
│   ├── pages/              # Main pages (Home, Developer)
│   ├── types/              # TypeScript type definitions
│   └── App.tsx             # Main app component
├── server/
│   ├── index.js            # Express API server
│   ├── setup-database.js   # Database initialization
│   └── emojis.db           # SQLite database (generated)
├── public/
│   └── emoji-icon.svg      # App favicon
└── emoji_database.csv      # Source emoji data
```

## API Endpoints

### Get Emojis
```
GET /api/emojis?search=smile&category=Smileys&page=1&limit=50
```

### Get Categories
```
GET /api/categories
```

### Add Emoji
```
POST /api/emojis
{
  "emoji": "😊",
  "name": "smiling face",
  "keywords": "happy;smile;joy",
  "category": "Smileys & People",
  "unicode": "U+1F60A"
}
```

### Update Emoji
```
PUT /api/emojis/:id
```

### Delete Emoji
```
DELETE /api/emojis/:id
```

## Database Management

The SQLite database is automatically created from your CSV file. To update the emoji data:

1. Modify `emoji_database.csv`
2. Run `npm run setup-db` to recreate the database
3. Restart the server

You can also use the API endpoints to add, update, or delete emojis programmatically.

## CSV Format

The CSV file should have these columns:
```
emoji,name,keywords,category,unicode
😀,grinning face,happy;smile;grin;joy,Smileys & People,U+1F600
```

## Customization

### Colors
Edit the gradient colors in `src/index.css` and component files.

### Categories
Categories are automatically extracted from your emoji data.

### Styling
The app uses Tailwind-style classes with custom CSS. Modify `src/index.css` for global styles.

## Deployment

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Tech Stack

- **Frontend**: React 18, TypeScript, Framer Motion
- **Backend**: Node.js, Express
- **Database**: SQLite3
- **Build Tool**: Vite
- **Styling**: Custom CSS with Tailwind-inspired utilities
- **Icons**: Lucide React

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project for any purpose.

---

Built with ❤️ for the emoji community