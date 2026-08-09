export const cloudinaryConfig = {
  cloudName: 'akw21id4',
  uploadPreset: 'amavya_unsigned_products',
  folder: 'amavya/products',
};

export const hasCloudinaryConfig = Boolean(
  cloudinaryConfig.cloudName && cloudinaryConfig.uploadPreset,
);
