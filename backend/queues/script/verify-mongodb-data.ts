import { JSONObject } from 'serverless-esbuild/dist/types';
import * as fs from 'fs';

/*
  Script used to verify if we find exactly the same data in mongodb
  on the first implementation of webhook and the serverless webhook implementation

  -> Export mongoDB data from the tow different collection with the filter  -> (don't forget to replace the dates)
          {created:{$gte:ISODate("2023-03-07"),$lte:ISODate("2023-03-08")}}

  -> Add the new json test files in the folder " script/test-files-ignored/  ", the files will be ignored by GIT
  -> Run the script with
          npx ts-node script/verify-mongodb-data.ts yourJson1.json yourJson2.json
*/

class jsonDifference {
  public attribute: string;
  public value1: string;
  public value2: string;
  public jsonId: string;

  constructor(attribute: string, value1: string, value2: string, jsonId: string) {
    this.attribute = attribute;
    this.value1 = value1;
    this.value2 = value2;
    this.jsonId = jsonId;
  }
}

class CompareMongoDB {
  public jsonfile1: JSONObject;
  public jsonfile2: JSONObject;

  constructor(pathFile1: string, pathFile2: string) {
    this.jsonfile1 = JSON.parse(fs.readFileSync(pathFile1, 'utf8'));
    this.jsonfile2 = JSON.parse(fs.readFileSync(pathFile2, 'utf8'));
  }

  compareTwoJsonFiles(log = false): boolean {
    return this.isJsonEqual(this.jsonfile1, this.jsonfile2, log);
  }

  saveDifferenceTwoJson(attributes: string[], jsonId: string, log = false): jsonDifference[] {
    const allJsonKeys1 = Object.keys(this.jsonfile1);
    let jsonElementNotFound = 0;

    const differences: jsonDifference[] = [];

    for (const key of allJsonKeys1) {
      const jsonTemp: JSONObject = this.jsonfile1[key];

      if (log) {
        console.log('  - JsonID : ' + jsonTemp[jsonId]);
      }
      try {
        const jsonToCompare: JSONObject = this.jsonfile2.find((e: JSONObject) => e[jsonId] === jsonTemp[jsonId]);
        this.saveDifferenceTwoJsonRec(jsonTemp, jsonToCompare, attributes, differences, jsonTemp[jsonId], log);
      } catch (err: any) {
        jsonElementNotFound += 1;
        if (log) {
          console.log(' -' + jsonTemp[jsonId] + '- not found in json file 2');
        }
      }
    }
    console.log('  Number of json element not found : ' + jsonElementNotFound);
    return differences;
  }

  //-------- Private methods --------//

  private isJsonEqual(obj1: JSONObject, obj2: JSONObject, log = false): boolean {
    const obj1Keys = Object.keys(obj1);
    const obj2Keys = Object.keys(obj2);

    if (obj1Keys.length !== obj2Keys.length) {
      if (log) {
        console.log('  Different length ');
      }
      return false;
    }

    for (const objKey of obj1Keys) {
      if (obj1[objKey] !== obj2[objKey]) {
        if (typeof obj1[objKey] == 'object' && typeof obj2[objKey] == 'object') {
          if (!this.isJsonEqual(obj1[objKey], obj2[objKey], log)) {
            if (log) {
              console.log('  Difference ');
            }
            return false;
          }
        } else {
          if (log) {
            console.log('  Difference ');
          }
          return false;
        }
      }
    }
    if (log) {
      console.log('  isJsonEqual : TRUE');
    }
    return true;
  }

  private saveDifferenceTwoJsonRec(
    obj1: JSONObject,
    obj2: JSONObject,
    attributes: string[],
    differences: jsonDifference[],
    jsonId: string,
    log = false,
  ): boolean {
    const obj1Keys = Object.keys(obj1);

    for (const objKey of obj1Keys) {
      if (log) {
        console.log('  ObjKey Attribute : ' + objKey + ' : ' + obj1[objKey] + ' / ' + obj2[objKey]);
      }

      if ((typeof obj1[objKey] == 'string' || typeof obj2[objKey] == 'string') && attributes.find((e) => e === objKey) != objKey) {
        if (log) {
          console.log('  Attribute to ignore ' + objKey + ' : ' + attributes.find((e) => e === objKey));
        }
      } else {
        if (log) {
          console.log('  Attribute to check ' + objKey + ' : ' + attributes.find((e) => e === objKey));
        }

        if (obj1[objKey] !== obj2[objKey]) {
          if (typeof obj1[objKey] == 'object' && typeof obj2[objKey] == 'object') {
            if (!this.saveDifferenceTwoJsonRec(obj1[objKey], obj2[objKey], attributes, differences, jsonId, log)) {
              if (log) {
                console.log('  Different content on target attribute');
                console.log(' False because -> ' + objKey + ' : ' + obj1[objKey] + ' / ' + obj2[objKey]);
              }
              const diff: jsonDifference = new jsonDifference(objKey, obj1[objKey], obj2[objKey], jsonId);
              differences.push(diff);
            }
          } else {
            if (log) {
              console.log('  Different content on target attribute ');
              console.log(' False because -> ' + objKey + ' : ' + obj1[objKey] + ' / ' + obj2[objKey]);
            }
            const diff: jsonDifference = new jsonDifference(objKey, obj1[objKey], obj2[objKey], jsonId);
            differences.push(diff);
          }
        }
      }
    }
    if (log) {
      console.log('  Json equal : True');
    }
    return true;
  }
}

const path = 'script/test-files-ignored/';

const argument1 = path + process.argv[2];
const argument2 = path + process.argv[3];
console.log('------------');
console.log(`   Read files : '${argument1}'   '${argument2}'`);

if (argument1 === undefined || argument2 === undefined) {
  console.log('Error : Two JSON files expected as parameter');
} else {
  const compareMongoDB = new CompareMongoDB(argument1, argument2);

  console.log('------------ Attributes to test --------------');

  const attributes: string[] = ['event', 'emailConfidence'];

  for (const att in attributes) {
    console.log(' - ' + attributes[att]);
  }

  console.log('------------ Compare precisely the two Json Files --------------');
  console.log(compareMongoDB.compareTwoJsonFiles());

  console.log('------------ Compare the two Json Files only with the attributes and save the differences --------------');
  const differences: jsonDifference[] = compareMongoDB.saveDifferenceTwoJson(attributes, 'email');

  for (const diff in differences) {
    console.log(
      'Diff ' +
        diff +
        ' for ' +
        differences[diff].jsonId +
        ' - ' +
        differences[diff].attribute +
        ' : ' +
        differences[diff].value1 +
        ' / ' +
        differences[diff].value2,
    );
  }
}
