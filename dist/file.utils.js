"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageFileFilter = exports.fileNameEditor = void 0;
const common_1 = require("@nestjs/common");
const fileNameEditor = (req, file, callback) => {
    const newFileName = file.originalname;
    callback(null, newFileName);
};
exports.fileNameEditor = fileNameEditor;
const imageFileFilter = (req, file, callback) => {
    if (!file.originalname ||
        !file.originalname.match(/\.(jpg|jpeg|png|gif|sgv|webp)$/)) {
        return callback(new common_1.BadRequestException('Arcihvo no permitido. Extensiones permitidas: jpg, jpeg, png, gif, sgv, webp'), false);
    }
    callback(null, true);
};
exports.imageFileFilter = imageFileFilter;
//# sourceMappingURL=file.utils.js.map