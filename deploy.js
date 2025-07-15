const ghpages = require('gh-pages');

ghpages.publish('dist', {
  repo: 'https://github.com/TimmyBartelius/Gissa-Ordet-.git',
}, (err) => {
  if (err) {
    console.error('Deploy failed:', err);
  } else {
    console.log('Deploy successful!');
  }
});