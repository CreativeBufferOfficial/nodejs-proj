const { Parser } = require('json2csv');

export class JSONCSVService {
  async generateFile(data: any[], fields: string[]) {

    const opts = { fields };

    try {
      const parser = new Parser(opts);
      const csv = parser.parse(data);
      return csv;
    } catch (err) {
      console.error('CSV_GENERATOR_ERROR', err);
    }
  }
}
