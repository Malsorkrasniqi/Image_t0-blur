import React, { useState } from "react";
import { saveAs } from "file-saver";
import "./ImageEditor.css";
import { Helmet } from "react-helmet";



const ImageEditor = () => {
  const [images, setImages] = useState([]); // State për imazhet e ngarkuara
  const [selectedImage, setSelectedImage] = useState(null); // State për imazhin e zgjedhur
  const [blurLevel, setBlurLevel] = useState(10); // State për nivelin e blur-it
  const [format, setFormat] = useState("png"); // State për formatin e shkarkimit
  const [size, setSize] = useState("1920x1080"); // State për madhësinë e imazhit

  // Funksioni për të ngarkuar imazhet
  const handleImageUpload = (event) => {
    const files = event.target.files; // Merr të gjitha skedarët e zgjedhur nga përdoruesi
    if (files && files.length > 0) {
      const newImages = [];
      for (let i = 0; i < files.length; i++) {
        const reader = new FileReader(); // Krijo një FileReader për të lexuar skedarin
        reader.onload = (e) => {
          newImages.push(e.target.result); // Shto imazhin në listë
          if (newImages.length === files.length) {
            setImages([...images, ...newImages]); // Vendos të gjitha imazhet në state
            if (!selectedImage) setSelectedImage(newImages[0]); // Zgjidh automatikisht imazhin e parë
          }
        };
        reader.readAsDataURL(files[i]); // Lexo skedarin si Data URL
      }
    }
  };

  // Funksioni për të krijuar dhe shkarkuar një imazh me blur
  const processAndDownloadImage = (image) => {
    if (!image) return; // Nëse nuk ka imazh, mos bëj asgjë

    const canvas = document.createElement("canvas"); // Krijo një canvas për të manipuluar imazhin
    const ctx = canvas.getContext("2d"); // Merr kontekstin e canvas-it
    const img = new Image(); // Krijo një objekt imazh
    img.src = image; // Vendos imazhin si burim
    img.onload = () => {
      const [width, height] = size.split("x").map(Number); // Merr dimensionet e zgjedhura nga përdoruesi
      canvas.width = width; // Vendos gjerësinë e canvas-it
      canvas.height = height; // Vendos lartësinë e canvas-it

      // Vizato background-in e blurruar
      ctx.filter = `blur(${blurLevel}px)`; // Aplikoni blur-in
      ctx.drawImage(img, 0, 0, width , height ); // Vizato imazhin në canvas

      
      // Vizato foreground-in (fotoja e vogël) pa blur
      ctx.filter = "none"; // Heq blur-in
      const scaleFactor = 0.95; // P.sh., 90% e madhësisë së përshtatur
      const scale = Math.min(width / img.width, height / img.height) * scaleFactor;// Shkalla e rritjes pa dalë nga korniza
      const newWidth = img.width * scale;
      const newHeight = img.height * scale;
      ctx.drawImage(
        img,
        (width - newWidth) / 2, // Poziciono në qendër horizontale
        (height - newHeight) / 2, // Poziciono në qendër vertikale
        newWidth,
        newHeight
      );

      // Shkarko imazhin
      canvas.toBlob((blob) => {
        saveAs(blob, `image_${Date.now()}`); // Përdor file-saver për të shkarkuar imazhin
      });
    };
  };

  // Funksioni për të shkarkuar një imazh të zgjedhur
  const handleDownloadSelected = () => {
    processAndDownloadImage(selectedImage); // Shkarko imazhin e zgjedhur
  };

  // Funksioni për të shkarkuar të gjitha imazhet
  const handleDownloadAll = () => {
    images.forEach((img) => processAndDownloadImage(img)); // Shkarko çdo imazh
  };

  return (
    
    
    <div className="container">
      
      <title>Image Blur</title>
      <div className="controls">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="input-file"
          multiple // Lejo ngarkimin e shumë fotove
        />
        <label>Blur Level:</label>
        <input
          type="range"
          min="0"
          max="20"
          class="slider"
          value={blurLevel}
          
          onChange={(e) => setBlurLevel(e.target.value)}
          className="slider"
        />
        <select value={size} onChange={(e) => setSize(e.target.value)} className="select">
          <option value="1920x1080">1920x1080</option>
        </select>
        <select value={format} onChange={(e) => setFormat(e.target.value)} className="select">
          <option value="png">PNG</option>
        </select>
        <button onClick={handleDownloadSelected} className="button">Download Selected</button>
        <button onClick={handleDownloadAll} className="button">Download All</button>
      </div>

      {/* Lista e fotove të ngarkuara */}
      <div className="image-list">
        {images.map((img, index) => (
          <div
            key={index}
            className={`image-item ${selectedImage === img ? "selected" : ""}`}
            onClick={() => setSelectedImage(img)} // Zgjidh imazhin kur klikohet
          >
            <img src={img} alt={`Uploaded ${index}`} />
          </div>
        ))}
      </div>

      {selectedImage && (
  <div className="preview-container">
    <div
      className="preview-background"
      style={{
        backgroundImage: `url(${selectedImage})`, // Përdor backticks
        filter: `blur(${blurLevel}px)`, // Përdor backticks këtu gjithashtu
        backgroundSize: "cover",
        backgroundPosition: "center",
        width: "100%",
        height: "100%",
      }}
    />
    <div
      className="preview-foreground"
      style={{
        backgroundImage: `url(${selectedImage})`, // Përdor backticks këtu gjithashtu
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        width: "100%",
        height: "100%",
      }}
    />
  </div>
)}
    </div>
  );
};

export default ImageEditor;