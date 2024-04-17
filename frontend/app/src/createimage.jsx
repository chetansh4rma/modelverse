import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import AvatarEditor from 'react-avatar-editor';
import './createimage.css';

const ThemesComponent = () => {
  const [themes, setThemes] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState("Surprise me");
  const [generatedImages, setGeneratedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [selectedButton, setSelectedButton] = useState(null);
  const [selectedImageStyle, setSelectedImageStyle] = useState({});
  const [rotationAngle, setRotationAngle] = useState(0);
  const [description, setDescription] = useState('');
  const [showDescription, setShowDescription] = useState(false);
  const [showThemes, setShowThemes] = useState(true);
  const [scale, setScale] = useState(1);
  const [showGallery, setShowGallery] = useState(false);
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchThemes = async () => {
      try {
        const response = await axios.post("http://localhost:3001/themes");
        console.log(response.data)
        setThemes(response.data);
      } catch (error) {
        console.error('Error fetching themes:', error);
      }
    };

    fetchThemes();
  }, []);
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.post("http://localhost:3001/fetchimage");
        const imageUrls = response.data;
        setGeneratedImages(imageUrls.reverse());
      } catch (error) {
        console.error('Error fetching images from gallery:', error);
      }
    };
  
    fetchImages();
  }, [generatedImages]);
  
  useEffect(() => {
    const calculateInitialScale = () => {
      const container = document.querySelector('.image-upload-container1');
      if (container && selectedImage) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const image = new Image();
        image.onload = () => {
          const imageWidth = image.naturalWidth;
          const imageHeight = image.naturalHeight;
          const scaleToFitWidth = (containerWidth * 0.7) / imageWidth;
          const scaleToFitHeight = (containerHeight * 0.7) / imageHeight;
          const initialScale = Math.min(scaleToFitWidth, scaleToFitHeight);
          setScale(initialScale);
        };
        image.src = URL.createObjectURL(selectedImage);
      }
    };
  
    if (selectedImage) {
      calculateInitialScale();
    }
  }, [selectedImage]);
  

  const handleThemeSelect = (theme) => {
    setSelectedTheme(theme);
    setSelectedButton(theme);
    setShowThemes(true);
    setShowDescription(false);
  };

  
  const handleImageSelect = (event) => {
    setSelectedImage(event.target.files[0]);
    setSelectedButton(null);
    const imageInput = document.getElementById("image-input");
    if (imageInput) {
      imageInput.disabled = true;
    }
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleDescriptionSubmit = () => {
    setDescription('');
  };

  const handleGenerateImage = async () => {
    try {
      if (!selectedImage || !selectedTheme) {
        alert('Please select both an image and a theme.');
        return;
      }

      if (!editorRef.current) {
        alert('Please select an image and set its scale.');
        return;
      }

      const canvas = editorRef.current.getImageScaledToCanvas();
      const imageData = canvas.toDataURL('image/png'); 
      const formData = new FormData();
      formData.append('image', imageData);
      formData.append('theme', selectedTheme);
      formData.append('description', description);

      const response = await axios.post("http://localhost:3001/create", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      const imageUrl = `http://localhost:3001/${response.data}`;
    } catch (error) {
      console.error('Error generating image:', error);
    }
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  const handleRotateLeft = () => {
    setRotationAngle(angle => angle - 90);
  };

  const handleRotateRight = () => {
    setRotationAngle(angle => angle + 90);
  };

  const handleScaleChange = (event) => {
    setScale(parseFloat(event.target.value));
  };

  useEffect(() => {
    setSelectedImageStyle({
      ...selectedImageStyle,
      transform: `rotate(${rotationAngle}deg)`,
    });
  }, [rotationAngle]);

  const handleGalleryToggle = async () => {
    try {
      setShowGallery(!showGallery);
      
      const response = await axios.post("http://localhost:3001/fetchimage");
      const imageUrls = response.data;
      
      console.log(imageUrls)
      setGeneratedImages(imageUrls);
    } catch (error) {
      console.error('Error fetching images from gallery:', error);
    }
  };

  return (
    <div className="themes-container">
      <div className="sidebar">
        <div className="themes-heading">
          <a href="#" style={{ marginLeft: "1vw" }} onClick={() => { setShowThemes(true); setShowDescription(false); }}>Themes</a>
          <a href="#" style={{ marginLeft: "5vw" }} onClick={() => { setShowDescription(true); setShowThemes(false); }}>Description</a>
        </div>
        {showThemes && (
          <ul className="theme-list">
            {themes.map(theme => (
              <li key={theme.id} className="theme-item">
                <button
                  onClick={() => handleThemeSelect(theme.label)}
                  className="theme-button"
                  style={{
                    border: selectedButton === theme.label ? '1px solid black' : 'none',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {theme.thumbnail && <img src={theme.thumbnail} alt={theme.label} className="theme-image" />}
                  {theme.label}
                </button>
              </li>
            ))}
          </ul>
        )}
        {showDescription && (
          <div className="description-input">
            <input
              type="text"
              value={description}
              onChange={handleDescriptionChange}
              placeholder="Enter Description"
            />
            <button onClick={handleDescriptionSubmit}>Submit Description</button>
          </div>
        )}
      </div>
      <div className="main-content">
        <div className="image-upload-container1">
          <label htmlFor="image-input" className="image-label" onClick={toggleZoom}>
            {selectedImage ? (
              <AvatarEditor
                ref={editorRef}
                image={URL.createObjectURL(selectedImage)}
                width={400} 
                height={400} 
                border={0} 
                color={[255, 255, 255, 0.6]}
                scale={scale}
                rotate={rotationAngle}
                onImageChange={() => {
                  const newImage = editorRef.current.getImage();
                  console.log('New image data:', newImage);
                }}
              />
            ) : (
              <div className="upload-instructions">
                <p>Upload a photo of your removed background product</p>
                <p>Drop your image here or click to select an image</p>
              </div>
            )}
          </label>
          <input
            id="image-input"
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: 'none' }}
            className='input4image'
          />
        </div>
        <div className="scale-container">
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.01"
            value={scale}
            onChange={handleScaleChange}
          />
        </div>
        <div className="rotate-buttons">
          <button onClick={handleRotateLeft} className="rotate-left">Rotate Left</button>
          <button onClick={handleRotateRight} className="rotate-right">Rotate Right</button>
        </div>
        <button onClick={handleGenerateImage} className="generate-button">Generate Image</button>
        <div className="recents">
          <div className="recents-container">
            {generatedImages.map((imageUrl, index) => (
              <div key={index} className="response-image-container">
                <a href={imageUrl} download={`generated_image_${index}.png`}>
                <img src={`http://localhost:3001/${imageUrl}`} alt={`Image ${index}`} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemesComponent;
