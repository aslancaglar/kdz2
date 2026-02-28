const fs = require('fs');
const glob = require('glob');

const files = glob.sync('app/admin/*/page.tsx');

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes("from '../../components/")) {
        content = content.replace(/from '\.\.\/\.\.\/components\//g, "from '../../../src/components/");
        fs.writeFileSync(file, content);
        console.log('Fixed imports in ' + file);
    }
}
