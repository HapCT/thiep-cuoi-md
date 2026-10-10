import { useState, useEffect } from 'react';
import './App.css';

// --- COMPONENT THIỆP MỜI VÀ HIỆU ỨNG MỞ BAO THƯ ---
const EnvelopeCard = ({ data, interactive = true }) => {
  const [stage, setStage] = useState(0);

  const handleOpen = () => {
    if (!interactive || stage > 0) return;
    
    // Giai đoạn 1: Mở nắp bao thư
    setStage(1);
    
    // Giai đoạn 2: Thiệp đứng yên, vỏ thư tụt xuống
    setTimeout(() => {
      setStage(2);
    }, 700);

    // Giai đoạn 3: Vỏ bao thư tụt mất, thiệp phóng to
    setTimeout(() => {
      setStage(3);
    }, 1500);
  };
  
  return (
    <div className={`envelope-container stage-${stage}`} onClick={handleOpen}>
      
      {/* 1. LỚP LƯNG BAO THƯ (z-index: 1) */}
      <div className="env-back"></div>
      
      {/* 2. NẮP TRÊN BAO THƯ (Được tách riêng để lật ra sau thiệp) */}
      <div className="env-top"></div>
      
      {/* 3. CHIẾC THIỆP (Nằm giữa lớp lưng, nắp trên và lớp mặt trước) */}
      <div className="invitation-card template-card">
        <h2 className="template-title" style={{ whiteSpace: 'pre-line' }}>
          {data.title}
        </h2>
        <p className="template-subtitle">{data.subtitle}</p>
        
        <div className="template-image-container">
          <img 
            src={data.image} 
            alt="Couple" 
            className="template-image" 
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400'; }}
          />
        </div>
        
        <h1 className="template-names">{data.names}</h1>
      </div>

      {/* 4. LỚP MẶT TRƯỚC BAO THƯ (z-index: 3) */}
      <div className="env-front">
        <div className="env-left"></div>
        <div className="env-right"></div>
        <div className="env-bottom"></div>
      </div>

      {/* 5. CON DẤU */}
      <div className="env-seal">MỞ</div>
      
      {/* Dòng chữ hướng dẫn */}
      {stage === 0 && <div className="click-to-open">Chạm để mở thiệp</div>}
    </div>
  );
};

function App() {
  const [isViewerMode, setIsViewerMode] = useState(false);
  const [viewerData, setViewerData] = useState(null);
  const [generatedLink, setGeneratedLink] = useState('');

  const [templateData, setTemplateData] = useState({
    title: 'This is the most beautiful\nSAVE THE DATE',
    subtitle: "I've seen in my life 🤩💍",
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400',
    names: 'Anh & Em'
  });

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const dataParam = queryParams.get('data');
    if (dataParam) {
      try {
        const decodedString = decodeURIComponent(atob(dataParam));
        const parsedData = JSON.parse(decodedString);
        setViewerData(parsedData);
        setIsViewerMode(true);
      } catch (error) {
        console.error("Link không hợp lệ", error);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTemplateData({ ...templateData, [name]: value });
    setGeneratedLink('');
  };

  const generateLink = () => {
    const encodedData = btoa(encodeURIComponent(JSON.stringify(templateData)));
    const link = `${window.location.origin}?data=${encodedData}`;
    setGeneratedLink(link);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedLink);
    alert('Đã copy link! Gửi cho bạn bè để họ nhận bao thư nhé.');
  };

  if (isViewerMode && viewerData) {
    return (
      <div className="viewer-container full-screen-envelope">
        <EnvelopeCard data={viewerData} interactive={true} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="editor-panel">
        <h1>Wedding Builder 💌</h1>
        <p>Giao diện có hiệu ứng bao thư! Chỉnh sửa và xuất link nhé.</p>
        
        <div className="input-group">
          <label>Tiêu đề</label>
          <input type="text" name="title" value={templateData.title} onChange={handleInputChange} />
        </div>

        <div className="input-group">
          <label>Phụ đề</label>
          <input type="text" name="subtitle" value={templateData.subtitle} onChange={handleInputChange} />
        </div>

        <div className="input-group">
          <label>Tên cặp đôi</label>
          <input type="text" name="names" value={templateData.names} onChange={handleInputChange} />
        </div>

        <div className="input-group">
          <label>Link hình ảnh</label>
          <input type="text" name="image" value={templateData.image} onChange={handleInputChange} />
        </div>

        <div className="actions">
          <button className="generate-btn" onClick={generateLink}>
            ✨ Đóng Gói & Tạo Link Gửi Đi
          </button>
        </div>

        {generatedLink && (
          <div className="link-result">
            <p>Bao thư của bạn đã sẵn sàng:</p>
            <div className="link-box">
              <input type="text" readOnly value={generatedLink} />
              <button onClick={copyToClipboard}>Copy</button>
            </div>
          </div>
        )}
      </div>

      <div className="preview-panel">
        <div className="phone-mockup">
          <EnvelopeCard data={templateData} interactive={true} />
        </div>
      </div>
    </div>
  );
}

export default App;
