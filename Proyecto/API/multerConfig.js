const multer = require('multer');
const ImageKit = require('imagekit');
const path = require('path');

// Configuración de ImageKit
const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

// Configuración de Multer en memoria
const storage = multer.memoryStorage();

// Configuración común para Multer
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Solo se permiten imágenes (JPEG, JPG, PNG, GIF)'));
};

const limits = {
  fileSize: 5 * 1024 * 1024 // Límite de 5MB
};

// Middleware para logos de empresas
const uploadLogoEmpresa = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits
});

// Middleware para fotos de productos
const uploadFotoProducto = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits
});

// Middleware para fotos de productos dañados
const uploadFotoProductoDanado = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: limits
});

// Función para subir logos de empresas a ImageKit
const uploadLogoToImageKit = (file) => {
  return uploadToImageKit(file, 'logos_empresas');
};

// Función para subir fotos de productos a ImageKit
const uploadProductoToImageKit = (file) => {
  return uploadToImageKit(file, 'productos_empresas');
};

// Función para subir fotos de productos a ImageKit
const uploadProductoDanadoImageKit = (file) => {
  return uploadToImageKit(file, 'productos_en_dañados');
};

// Función genérica para subir a ImageKit
const uploadToImageKit = (file, folder) => {
  return new Promise((resolve, reject) => {
    imagekit.upload({
      file: file.buffer,
      fileName: `${folder.split('_')[0]}_${Date.now()}${path.extname(file.originalname)}`,
      folder: folder,
      useUniqueFileName: true,
      overwriteFile: false,
      overwriteAITags: false,
      overwriteCustomMetadata: false
    }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
  uploadLogoEmpresa,
  uploadFotoProducto,
  uploadFotoProductoDanado,
  uploadLogoToImageKit,
  uploadProductoToImageKit, 
  uploadProductoDanadoImageKit
  
};