const fortuneCookies = [
  'Conquer your fears or they will conquer you.',
  'Rivers need springs.',
  "Do not fear what you don't know.",
  'You will have a pleasant surprise.',
  'Whenever possible, keep it simple.',
];

// exports is the Node way of exporting modules for use around the project
exports.getFortune = () => {
  const idx = Math.floor(Math.random() * fortuneCookies.length);
  return fortuneCookies[idx];
};
