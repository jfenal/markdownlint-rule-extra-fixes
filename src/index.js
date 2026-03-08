/**
 * markdownlint-rule-extra-fixes
 * Custom rules that provide fixInfo for rules the core does not fix.
 */
import md013 from "./rules/md013.js";
import md033 from "./rules/md033.js";
import md036 from "./rules/md036.js";
import md040 from "./rules/md040.js";
import md041 from "./rules/md041.js";
import md042 from "./rules/md042.js";
import md047 from "./rules/md047.js";

export default [md041, md040, md013, md036, md042, md033, md047];
