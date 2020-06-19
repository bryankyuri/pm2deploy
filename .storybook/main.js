module.exports = {
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-actions",
    "@storybook/addon-links",
    "@storybook/addon-viewport",
    "@storybook/addon-notes"
  ],
  stories: ["../src/**/*(*.)stories.{js,mdx}"]
};
