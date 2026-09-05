import sharp from 'sharp';
import { readdir } from 'fs/promises';

const dirs = [
  '/home/z/my-project/public/products',
  '/home/z/my-project/public/hero',
];

for (const dir of dirs) {
  const files = (await readdir(dir)).filter(f => f.endsWith('.png'));
  for (const f of files) {
    const input = `${dir}/${f}`;
    const output = `${dir}/${f.replace('.png', '.jpg')}`;
    await sharp(input).jpeg({ quality: 88 }).toFile(output);
    console.log('converted', dir, f, '->', f.replace('.png', '.jpg'));
  }
}
