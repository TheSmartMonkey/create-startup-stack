import crypto, { BinaryToTextEncoding } from 'crypto';

export class Utils {
  /**
   * Create a hash
   * @param str the strung to hash
   * @param algo the algorithm to use MD5 | SHA1 | SHA256
   * @param digest the output string
   * @return {string}
   */
  static hashString(str: string, algo: string, digest?: BinaryToTextEncoding): string {
    algo = algo || 'md5';
    digest = digest || 'hex';
    return crypto.createHash(algo).update(str).digest(digest);
  }

  /**
   * For [1,2,3] [2,3] it will yield [1]. On the other hand, for [1,2,3] [2,3,5] will return the same thing
   */
  static getDifferenceOfTwoLists<T>(list1: T[], list2: T[]): T[] {
    return list1.filter((l) => !list2.includes(l));
  }

  static generateUUID(): string {
    return crypto.randomUUID();
  }

  static getAnyByStageType<T>({ prod, dev }: { prod: T; dev: T }): T {
    return process.env.AWS_STAGE?.includes('prod') ? prod : dev;
  }
}
