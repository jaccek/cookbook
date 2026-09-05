# Recipe Cookbook

This project is a static GitHub Pages cookbook. It displays recipe cards, lets visitors search by recipe name or tag, and filters by tag.

## How it works

- The site is served as a static website from GitHub Pages.
- Recipe data lives in `data/recipes.json`.
- New recipes are added by editing that file and committing the change to the repository.
- The app reads the JSON file at runtime and renders the list automatically.

## Add a new recipe

1. Open `data/recipes.json`.
2. Add a new object to the `recipes` array.
3. Include:
   - `name`
   - `description`
   - `time`
   - `tags`
   - `ingredients`
   - `steps`
   - optional `image` or `images` for one or more photos
4. Commit the change and push it to the main branch.

## Example recipe object

```json
{
  "name": "Tomato Basil Pasta",
  "description": "A simple pantry pasta with fresh basil.",
  "time": "20 min",
  "image": "https://images.unsplash.com/...",
  "images": [
    "https://images.unsplash.com/...",
    "https://images.unsplash.com/..."
  ],
  "tags": ["dinner", "vegetarian", "easy"],
  "ingredients": [
    "200 g pasta",
    "2 tbsp olive oil",
    "2 cloves garlic",
    "2 cups cherry tomatoes",
    "Fresh basil"
  ],
  "steps": [
    "Cook the pasta until al dente.",
    "Sauté garlic and tomatoes in olive oil.",
    "Toss with pasta and basil before serving."
  ]
}
```

You can use either a single remote image via `image` or several photos via `images`.

## GitHub Pages deployment

1. Push the repository to GitHub.
2. Open the repository settings.
3. Navigate to Pages.
4. Select the main branch and root folder (`/`).
5. Save the configuration.

The site will be published at the GitHub Pages URL for the repository.
