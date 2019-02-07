import { configure, addDecorator } from "@storybook/react";
import { withInfo } from "@storybook/addon-info";

const req = require.context("../src", true, /.stories.js$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}
// addDecorator(
//   withInfo({
//     inline: true
//   })
// );
configure(loadStories, module);