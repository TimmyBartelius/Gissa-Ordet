const ghpages = require('gh-pages');

ghpages.publish('dist', {
  branch: 'gh-pages',
  repo: 'https://github.com/TimmyBartelius/Gissa-Ordet.git',
  user: {
    name: 'Timmy Bartelius',
    email: 'timmy.bartelius1@gmail.com'
  },
  message: 'Deploy via script'
}, function (err) {
  if (err) {
    console.error('Deploy failed:', err);
  } else {
    console.log('Deploy successful!');
  }
});