export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "calisthenics-skill-tree:theme";

// Apply the saved preference while parsing the page, before its first paint.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}})()`;
