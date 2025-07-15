const ghpages = require('gh-pages');

ghpages.publish('dist', 'gh-pages', {
  repo: 'https://github.com/TimmyBartelius/Gissa-Ordet.git',
  user: {
    name: 'Timmy Bartelius',
    email: 'din.email@exempel.se'
  },
  message: 'Deploy via script'
}, function (err) {
  if (err) {
    console.error('Deploy failed:', err);
  } else {
    console.log('Deploy successful!');
  }
});