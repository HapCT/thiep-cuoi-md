import { useState, useEffect, useRef } from 'react';
import './App.css';

// --- COMPONENT CÀO ẢNH ---
const ScratchOffImage = ({ src }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Cài đặt kích thước canvas trùng với CSS container (140x200)
    canvas.width = 140;
    canvas.height = 200;
    
    // Vẽ lớp phủ màu bạc (phần để cào)
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#cbd5e1'; // Màu xám bạc
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Vẽ chữ gợi ý lên lớp bạc
    ctx.font = "bold 16px 'Playfair Display', serif";
    ctx.fillStyle = "#475569";
    ctx.textAlign = "center";
    ctx.fillText("Cào thử đi! 🪙", canvas.width / 2, canvas.height / 2);

    let isDrawing = false;

    // Lấy tọa độ chuột hoặc ngón tay
    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const startDrawing = (e) => {
      isDrawing = true;
      scratch(e);
    };

    const stopDrawing = () => {
      isDrawing = false;
    };

    const scratch = (e) => {
      if (!isDrawing) return;
      if (e.cancelable) e.preventDefault(); // Ngăn cuộn trang khi đang cào trên điện thoại
      
      const { x, y } = getMousePos(e);
      
      // Xóa lớp bạc đi (biến pixel thành trong suốt) để lộ ảnh bên dưới
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 15, 0, Math.PI * 2); // Bán kính cục tẩy = 15px
      ctx.fill();
    };

    // Chuột
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', scratch);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    // Cảm ứng (Điện thoại)
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', scratch, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', scratch);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', scratch);
      canvas.removeEventListener('touchend', stopDrawing);
    };
  }, [src]); 

  return (
    <>
      {/* Lớp ảnh bên dưới */}
      <img 
        src={src} 
        alt="Couple" 
        className="template-image" 
        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400'; }}
      />
      {/* Lớp cào bên trên */}
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'absolute', 
          top: 0, left: 0, 
          zIndex: 10,
          cursor: 'crosshair',
          width: '100%',
          height: '100%',
          touchAction: 'none'
        }} 
      />
    </>
  );
};


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
          {data.effect === 'scratch' ? (
            <ScratchOffImage src={data.image} />
          ) : (
            <img 
              src={data.image} 
              alt="Couple" 
              className="template-image" 
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400'; }}
            />
          )}
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
    names: 'Anh & Em',
    effect: 'normal' // Giá trị mặc định
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
          <label>Hiệu ứng Ảnh</label>
          <select name="effect" value={templateData.effect} onChange={handleInputChange}>
            <option value="normal">Bình thường (Hiện sẵn ảnh)</option>
            <option value="scratch">Thẻ cào (Cào lớp bạc để xem ảnh)</option>
          </select>
        </div>

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
