const state = {
  recipes: [],
  selectedTag: 'all',
  searchTerm: '',
};

const recipeList = document.getElementById('recipeList');
const tagFilters = document.getElementById('tagFilters');
const searchInput = document.getElementById('searchInput');
const resultsCount = document.getElementById('resultsCount');

function normalizeSlug(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function ensureRecipeSlugs(recipes) {
  return recipes.map((recipe) => ({
    ...recipe,
    slug: recipe.slug || normalizeSlug(recipe.name),
  }));
}

function getRecipeBySlug(slug) {
  return state.recipes.find((recipe) => recipe.slug === slug);
}

function getRecipeImages(recipe) {
  if (Array.isArray(recipe.images) && recipe.images.length) {
    return recipe.images.filter(Boolean);
  }

  if (recipe.image) {
    return [recipe.image];
  }

  return [];
}

async function loadRecipes() {
  try {
    const response = await fetch('data/recipes.json');
    if (!response.ok) {
      throw new Error(`Unable to load recipe data: ${response.status}`);
    }

    const data = await response.json();
    state.recipes = ensureRecipeSlugs(data.recipes ?? []);
    renderTagFilters();
    renderRecipes();
  } catch (error) {
    if (!recipeList) return;

    recipeList.innerHTML = `
      <div class="empty-state">
        <h2>Nie można załadować przepisów</h2>
        <p>${error.message}</p>
      </div>
    `;
  }
}

function getAllTags() {
  const tags = state.recipes.flatMap((recipe) => recipe.tags ?? []);
  return [...new Set(tags)].sort((a, b) => a.localeCompare(b));
}

function renderTagFilters() {
  if (!tagFilters) return;

  const tags = getAllTags();

  const filterMarkup = [`
    <button class="tag-filter ${state.selectedTag === 'all' ? 'is-active' : ''}" data-tag="all" type="button">
      Wszystkie przepisy
    </button>
  `];

  tags.forEach((tag) => {
    filterMarkup.push(`
      <button class="tag-filter ${state.selectedTag === tag ? 'is-active' : ''}" data-tag="${tag}" type="button">
        ${tag}
      </button>
    `);
  });

  tagFilters.innerHTML = filterMarkup.join('');

  tagFilters.querySelectorAll('.tag-filter').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedTag = button.dataset.tag;
      renderTagFilters();
      renderRecipes();
    });
  });
}

function getVisibleRecipes() {
  const normalizedSearch = state.searchTerm.toLowerCase();

  return state.recipes.filter((recipe) => {
    const matchesTag =
      state.selectedTag === 'all' || (recipe.tags ?? []).includes(state.selectedTag);

    const searchableText = [
      recipe.name,
      ...(recipe.tags ?? []),
      recipe.description,
    ]
      .join(' ')
      .toLowerCase();

    const matchesSearch = searchableText.includes(normalizedSearch);

    return matchesTag && matchesSearch;
  });
}

function renderRecipes() {
  if (!recipeList) return;

  const visibleRecipes = getVisibleRecipes();

  if (resultsCount) {
    resultsCount.textContent = `${visibleRecipes.length} przepis${visibleRecipes.length === 1 ? '' : 'ów'}`;
  }

  if (!visibleRecipes.length) {
    recipeList.innerHTML = `
      <div class="empty-state">
        <h2>Brak przepisów spełniających filtry</h2>
        <p>Spróbuj innego słowa kluczowego lub wybierz inny tag.</p>
      </div>
    `;
    return;
  }

  recipeList.innerHTML = visibleRecipes
    .map((recipe) => {
      const primaryImage = getRecipeImages(recipe)[0];
      return `
        <article class="recipe-card">
          ${primaryImage ? `<img class="recipe-card__image" src="${primaryImage}" alt="${recipe.name}" loading="lazy" />` : ''}

          <div class="recipe-card__header">
            <h3>${recipe.name}</h3>
            <span class="recipe-card__meta">${recipe.time ?? 'Szybki posiłek'}</span>
          </div>

          <p class="recipe-card__description">${recipe.description}</p>

          <div class="recipe-card__tags">
            ${(recipe.tags ?? [])
              .map(
                (tag) => `
                  <button class="tag ${state.selectedTag === tag ? 'is-selected' : ''}" type="button" data-tag="${tag}">
                    #${tag}
                  </button>
                `
              )
              .join('')}
          </div>

          <a class="recipe-link" href="recipe.html?recipe=${encodeURIComponent(recipe.slug)}">Zobacz przepis</a>
        </article>
      `;
    })
    .join('');

  recipeList.querySelectorAll('.tag').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedTag = button.dataset.tag;
      renderTagFilters();
      renderRecipes();
    });
  });
}

function renderRecipeDetail() {
  const recipeDetail = document.getElementById('recipeDetail');
  if (!recipeDetail) return;

  const params = new URLSearchParams(window.location.search);
  const recipeSlug = params.get('recipe');
  const recipe = getRecipeBySlug(recipeSlug);

  if (!recipe) {
    recipeDetail.innerHTML = `
      <div class="empty-state">
        <h2>Nie znaleziono przepisu</h2>
        <p><a href="index.html">Powrót do listy przepisów</a></p>
      </div>
    `;
    return;
  }

  document.getElementById('recipeTitle').textContent = recipe.name;
  document.getElementById('recipeDescription').textContent = recipe.description;
  document.getElementById('recipeMeta').textContent = recipe.time ?? 'Szybki posiłek';

  const galleryContainer = document.getElementById('recipeGallery');
  const images = getRecipeImages(recipe);
  galleryContainer.innerHTML = (images.length ? images : [''])
    .filter(Boolean)
    .map(
      (imageUrl) => `
        <img src="${imageUrl}" alt="${recipe.name}" loading="lazy" />
      `
    )
    .join('');

  const tagsContainer = document.getElementById('recipeTags');
  tagsContainer.innerHTML = (recipe.tags ?? [])
    .map((tag) => `<span class="tag is-selected" type="button">#${tag}</span>`)
    .join('');

  document.getElementById('recipeIngredients').innerHTML = (recipe.ingredients ?? [])
    .map((ingredient) => `<li>${ingredient}</li>`)
    .join('');

  document.getElementById('recipeSteps').innerHTML = (recipe.steps ?? [])
    .map((step) => `<li>${step}</li>`)
    .join('');
}

if (document.body.dataset.page === 'recipe') {
  const recipe = new URLSearchParams(window.location.search).get('recipe');
  if (!recipe) {
    document.getElementById('recipeDetail').innerHTML = `
      <div class="empty-state">
        <h2>Nie wybrano przepisu</h2>
        <p><a href="index.html">Powrót do listy przepisów</a></p>
      </div>
    `;
  } else {
    loadRecipes().then(() => renderRecipeDetail());
  }
} else {
  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      state.searchTerm = event.target.value.trim().toLowerCase();
      renderRecipes();
    });
  }

  loadRecipes();
}
