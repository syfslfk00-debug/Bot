const { readdirSync } = require('fs');
const ascii = require('ascii-table');

let table = new ascii('الأحداث').setJustify();
table.setHeading('اسم الحدث', 'حالة التحميل');

module.exports = (client27) => {
  const events = readdirSync('./events/').filter((file) => file.endsWith('.js'));
  for (const file of events) {
    try {
      console.log(`تم تحميل الأحداث`)
      let pull = require(`../events/${file}`);
      if (pull.event && typeof pull.event !== 'string') {
        table.addRow(file, '❌');
        
        continue;
      }
      pull.event = pull.event || file.replace('.js', '');
      if (typeof pull.run !== 'function') {
        
        table.addRow(file, '❌');
        continue;
      }
      client27.on(pull.event, pull.run.bind(null, client27));
      
      table.addRow(file, '✔');
    } catch (error) {
      console.error(`خطأ أثناء تحميل الحدث '${file}':`, error);
      table.addRow(file, '❌');
    }
  }
};

console.log(table.toString())