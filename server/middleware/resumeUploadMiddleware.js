const multer = require("multer");
const path = require("path");
const fs = require("fs");


/* =====================================================
   UPLOAD DIRECTORY
===================================================== */

const uploadPath = path.join(
  __dirname,
  "../uploads/resumes"
);

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(
    uploadPath,
    { recursive: true }
  );
}


/* =====================================================
   STORAGE
===================================================== */

const storage =
  multer.diskStorage({
    destination: (
      req,
      file,
      cb
    ) => {
      cb(
        null,
        uploadPath
      );
    },

    filename: (
      req,
      file,
      cb
    ) => {
      const extension =
        path.extname(
          file.originalname
        );

      const uniqueName =
        `${Date.now()}-${Math.round(
          Math.random() * 1e9
        )}${extension}`;

      cb(
        null,
        uniqueName
      );
    },
  });


/* =====================================================
   FILE FILTER
===================================================== */

const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedMimeTypes = [
    "application/pdf",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const allowedExtensions = [
    ".pdf",
    ".docx",
  ];

  const extension =
    path
      .extname(
        file.originalname
      )
      .toLowerCase();

  if (
    allowedMimeTypes.includes(
      file.mimetype
    ) &&
    allowedExtensions.includes(
      extension
    )
  ) {
    cb(
      null,
      true
    );
  } else {
    cb(
      new Error(
        "Only PDF and DOCX files are allowed."
      ),
      false
    );
  }
};


/* =====================================================
   MULTER
===================================================== */

const resumeUpload =
  multer({
    storage,

    fileFilter,

    limits: {
      fileSize:
        10 * 1024 * 1024,
    },
  });


module.exports =
  resumeUpload;