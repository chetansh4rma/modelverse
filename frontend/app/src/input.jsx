import React, { useEffect, useState } from 'react';
import './input.css';

const AddNewAsset = () => {
  const [imageFile, setImageFile] = useState(null);
  const [productName, setProductName] = useState('');
  const [backgroundRemovedImage, setBackgroundRemovedImage] = useState(null);

  const handleImageUpload = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleProductNameChange = (e) => {
    setProductName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile);

      try {
        const response = await fetch('http://localhost:3001/remove-background', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          console.log('Image sent successfully');
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'background_removed_image.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          window.location.href="/create"
        } else {
          console.error('Failed to send image');
          throw new Error('Failed to send image');
        }
      } catch (error) {
        console.error('Error sending image:', error);
      }
    } else {
      console.error('No image selected');
    }
};

  return (
    <div className="container">
      <div className="header">
        <h2>Add new asset</h2>
      </div>
      <div className="main-container">
        <div className="image-upload">
          <label htmlFor="image-input">
            <div className="image-upload-container">
              {imageFile ? (
                <img src={URL.createObjectURL(imageFile)} alt="Product" />
              ) : backgroundRemovedImage ? (
                <img src={backgroundRemovedImage} alt="Background Removed" />
              ) : (
                <div className="upload-instructions">
                  <p>Upload a photo of your product</p>
                  <p>Aidobly can automatically remove the background from your photo</p>
                  <p>Drop your image here or click to select an image</p>
                </div>
              )}
            </div>
          </label>
          <input
            id="image-input"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
        </div>
        <div className="sidebar">
          <div className="product-name">
            <input
              type="text"
              placeholder="Product Name"
              value={productName}
              onChange={handleProductNameChange}
            />
          </div>
          <button type="submit" className="save-asset" onClick={handleSubmit}>
            Save asset
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddNewAsset;