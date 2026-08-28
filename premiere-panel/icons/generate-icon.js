const fs = require('fs');
const path = require('path');

// 1x1 transparent/colored PNG base64 converted to valid binary PNG
const base64Png = 'iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAYAAADgKtSgAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAA7SURBVEhL7c0xDQAwDASxW/q3s3B4wAYbK1qSS2/mFoc7cbgThztxuBOHO3G4E4c7cbgThztxuBOHO887D/U5Yw14s16DAAAAAElFTkSuQmCC';

const buffer = Buffer.from(base64Png, 'base64');
fs.writeFileSync(path.join(__dirname, 'icon-23.png'), buffer);
console.log('Generated icon-23.png successfully.');
