import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AdminLayout from '../../components/admin/AdminLayout';
import Cropper from 'react-easy-crop';
import { 
  FileEdit, 
  Image as ImageIcon, 
  Search, 
  Plus, 
  Globe, 
  Tag, 
  Calendar, 
  Save, 
  Eye, 
  Trash2,
  CheckCircle2,
  Layout,
  Newspaper,
  X,
  Upload,
  Filter,
  Video,
  FileText,
  Maximize2,
  Crop,
  Check,
  MoreVertical,
  Download,
  Cloud,
  Database,
  HardDrive,
  Clock,
  ChevronRight,
  Settings
} from 'lucide-react';
import { useContent, ContentItem } from '../../context/ContentContext';

export default function AdminContent() {
  const { content: contentList, addContent, updateContent, deleteContent } = useContent();
  const [activeTab, setActiveTab] = useState<'projects' | 'insights' | 'cloud'>('projects');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Published' | 'Draft' | 'Scheduled'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<ContentItem> | null>(null);
  
  // Cloud Storage Mock Data
  const [cloudUsage, setCloudUsage] = useState(0.042); // in TB
  const TOTAL_CAPACITY = 6.0; // TB
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestProgress, setIngestProgress] = useState(0);
  const [cloudNotification, setCloudNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);

  const handleCloudAction = (action: string) => {
    setCloudNotification({ message: `Initiating ${action} sequence...`, type: 'info' });
    setTimeout(() => {
      setCloudNotification({ message: `${action} completed successfully. structural integrity verified.`, type: 'success' });
      setTimeout(() => setCloudNotification(null), 3000);
    }, 2000);
  };

  const handleRapidIngest = () => {
    if (isIngesting) return;
    setIsIngesting(true);
    setIngestProgress(0);
    
    const interval = setInterval(() => {
      setIngestProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsIngesting(false);
            setCloudUsage(curr => Math.min(curr + 0.005, TOTAL_CAPACITY));
            setCloudNotification({ message: "Network ingestion complete. Artifacts synchronized with central ledger.", type: "success" });
            setTimeout(() => setCloudNotification(null), 3000);
          }, 500);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleViewArtifact = (media: any) => {
    window.open(media.url, '_blank');
  };

  const handleDeleteArtifact = (media: any) => {
    if (window.confirm(`Are you sure you want to purge artifact "${media.name || 'UNNAMED_ASSET'}" from the central ledger?`)) {
      setCloudNotification({ message: "Artifact purging sequence initiated...", type: 'info' });
      setTimeout(() => {
        setCloudNotification({ message: "Artifact purged. Storage volume recalibrating.", type: 'success' });
        setCloudUsage(prev => Math.max(0, prev - 0.001));
        setTimeout(() => setCloudNotification(null), 3000);
      }, 1500);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  // Cropper State
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [croppingSource, setCroppingSource] = useState<{ type: 'featured' | 'gallery', id?: string } | null>(null);

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const getCroppedImg = (imageSrc: string, pixelCrop: any): Promise<string> => {
    const image = new Image();
    image.src = imageSrc;
    return new Promise((resolve, reject) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('No ctx');

        canvas.width = pixelCrop.width;
        canvas.height = pixelCrop.height;

        ctx.drawImage(
          image,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          pixelCrop.width,
          pixelCrop.height
        );

        resolve(canvas.toDataURL('image/jpeg'));
      };
      image.onerror = (e) => reject(e);
    });
  };

  const handleCropSave = async () => {
    if (imageToCrop && croppedAreaPixels && croppingSource) {
      try {
        const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
        
        if (croppingSource.type === 'featured') {
          setEditingItem(prev => ({ ...prev, image: croppedImage }));
        } else if (croppingSource.type === 'gallery' && croppingSource.id) {
          setEditingItem(prev => ({
            ...prev,
            gallery: prev?.gallery?.map(asset => 
              asset.id === croppingSource.id ? { ...asset, url: croppedImage } : asset
            )
          }));
        }
        
        setIsCropperOpen(false);
        setCroppingSource(null);
      } catch (e) {
        console.error(e);
        console.error('Failed to crop image');
      }
    }
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const type = file.type.startsWith('video') ? 'video' : 'image';
          setEditingItem(prev => ({
            ...prev,
            gallery: [
              ...(prev?.gallery || []),
              { 
                type: type as 'image' | 'video', 
                url: reader.result as string, 
                id: Math.random().toString(36).substr(2, 9),
                size: file.size,
                name: file.name
              }
            ]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAttachmentUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        // We'll store the name, size and local URL
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditingItem(prev => ({
            ...prev,
            attachments: [
              ...(prev?.attachments || []),
              { 
                name: file.name, 
                url: reader.result as string, 
                id: Math.random().toString(36).substr(2, 9),
                size: file.size
              }
            ]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const filteredContent = contentList.filter(item => {
    const typeMatch = activeTab === 'projects' ? item.type === 'project' : item.type === 'insight';
    const statusMatch = statusFilter === 'All' || item.status === statusFilter;
    const searchMatch = (item.title || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                       (item.category || "").toLowerCase().includes(searchTerm.toLowerCase());
    return typeMatch && statusMatch && searchMatch;
  });

  const handleEdit = (item: ContentItem) => {
    setEditingItem(JSON.parse(JSON.stringify(item))); // Deep clone for editing
    setIsEditorOpen(true);
  };

  const handleAddNew = () => {
    setEditingItem({
      type: activeTab === 'projects' ? 'project' : 'insight',
      status: 'Draft',
      seo: { title: '', description: '', caption: '' },
      image: 'https://images.unsplash.com/photo-1541976590-713941fbc1c6?auto=format&fit=crop&q=80&w=2070'
    });
    setIsEditorOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setCroppingSource({ type: 'featured' });
        setIsCropperOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (editingItem?.id) {
      updateContent(editingItem as ContentItem);
    } else {
      addContent(editingItem as Omit<ContentItem, 'id' | 'date'>);
    }
    setIsEditorOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Content Management</h2>
            <p className="text-gray-400 mt-1">Manage public projects, insights, news, and SEO settings.</p>
          </div>
          <button 
            onClick={handleAddNew}
            className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-orange-500 transition-all shadow-lg shadow-orange-600/20 active:scale-95"
          >
            <Plus size={18} />
            {activeTab === 'projects' ? 'Add Featured Project' : 'Add Insight Post'}
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-black/40 border border-gray-800 p-1.5 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'projects' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <Layout size={16} />
            Featured Projects
          </button>
          <button 
            onClick={() => setActiveTab('insights')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'insights' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <Newspaper size={16} />
            Insights & News
          </button>
          <button 
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'cloud' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
          >
            <Cloud size={16} />
            6TB Media Hub
          </button>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-black/40 border border-gray-800 p-4 rounded-2xl">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900/50 border border-transparent focus:border-orange-600/50 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none transition-all"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter size={16} className="text-gray-500 hidden md:block" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="flex-1 md:flex-none bg-gray-900/50 border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-600 text-xs font-black uppercase tracking-widest"
            >
              <option value="All">All Status</option>
              <option value="Published">Published</option>
              <option value="Scheduled">Scheduled</option>
              <option value="Draft">Drafts</option>
            </select>
          </div>
        </div>

        {/* Content Grid / Cloud Hub Conditional Render */}
        {activeTab === 'cloud' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Storage Stats */}
              <div className="col-span-1 lg:col-span-2 bg-black/40 border border-gray-800 rounded-3xl p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase italic">Enterprise Cloud Infrastructure</h3>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1 italic">MADECC Global Media Network</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Available Bandwidth</p>
                      <p className="text-lg font-black text-blue-500 italic">Unlimited</p>
                    </div>
                    <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 border border-blue-500/20">
                      <Cloud size={20} />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-gray-400">Total Utilization: {cloudUsage.toFixed(3)} TB / {TOTAL_CAPACITY} TB</span>
                    <span className="text-blue-500">{((cloudUsage / TOTAL_CAPACITY) * 100).toFixed(2)}%</span>
                  </div>
                  <div className="h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-800 p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(cloudUsage / TOTAL_CAPACITY) * 100}%` }}
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-600">Video Assets</p>
                      <p className="text-xl font-black text-white mt-1 italic">12.4 GB</p>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-600">High-Res Images</p>
                      <p className="text-xl font-black text-white mt-1 italic">28.1 GB</p>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
                      <p className="text-[8px] font-black uppercase tracking-widest text-gray-600">Technical Docs</p>
                      <p className="text-xl font-black text-white mt-1 italic">1.5 GB</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cloud Settings/Actions */}
              <div className="bg-orange-600/5 border border-orange-600/20 rounded-3xl p-8 space-y-6 flex flex-col relative overflow-hidden">
                <h4 className="text-xs font-black uppercase tracking-widest text-orange-600">Nexus Controls</h4>
                <div className="space-y-3">
                  <button 
                    onClick={() => handleCloudAction('Partition Management')}
                    className="w-full flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-orange-600 transition-all text-gray-400 hover:text-white group"
                  >
                    <div className="flex items-center gap-3">
                      <HardDrive size={16} className="text-orange-600 group-hover:scale-110 transition-transform" />
                      Manage Partition
                    </div>
                    <ChevronRight size={14} />
                  </button>
                  <button 
                    onClick={() => handleCloudAction('CDN Configuration')}
                    className="w-full flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-orange-600 transition-all text-gray-400 hover:text-white group"
                  >
                    <div className="flex items-center gap-3">
                      <Settings size={16} className="text-orange-600 group-hover:rotate-90 transition-transform" />
                      Global CDN Config
                    </div>
                    <ChevronRight size={14} />
                  </button>
                  <button 
                    onClick={() => handleCloudAction('Node Backup')}
                    className="w-full flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-orange-600 transition-all text-gray-400 hover:text-white group"
                  >
                    <div className="flex items-center gap-3">
                      <Database size={16} className="text-orange-600 group-hover:scale-110 transition-transform" />
                      Backup Nodes
                    </div>
                    <ChevronRight size={14} />
                  </button>
                </div>
                <button 
                  onClick={handleRapidIngest}
                  disabled={isIngesting}
                  className={`mt-auto p-4 ${isIngesting ? 'bg-gray-800' : 'bg-blue-600 shadow-lg shadow-blue-600/20 hover:bg-blue-500'} text-white rounded-2xl flex flex-col items-center justify-center gap-3 transition-all relative overflow-hidden`}
                >
                  <div className="flex items-center gap-3">
                    {isIngesting ? <Clock size={18} className="animate-pulse" /> : <Upload size={18} />}
                    <span className="text-xs font-black uppercase tracking-widest">
                      {isIngesting ? `Ingesting... ${ingestProgress}%` : 'Rapid Ingest'}
                    </span>
                  </div>
                  {isIngesting && (
                    <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full">
                      <motion.div 
                        className="h-full bg-white"
                        initial={{ width: 0 }}
                        animate={{ width: `${ingestProgress}%` }}
                      />
                    </div>
                  )}
                </button>

                <AnimatePresence>
                  {cloudNotification && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`absolute bottom-4 left-4 right-4 p-3 rounded-xl border flex items-center gap-3 z-10 backdrop-blur-xl ${
                        cloudNotification.type === 'success' 
                        ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                        : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                      }`}
                    >
                      {cloudNotification.type === 'success' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                      <span className="text-[10px] font-black uppercase tracking-widest">{cloudNotification.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Cloud Media Browser */}
            <div className="bg-black/40 border border-gray-800 rounded-3xl overflow-hidden">
               <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/50">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white">Central Artifact Repository</h4>
                  <div className="flex gap-2">
                    <button className="p-2 text-gray-500 hover:text-white"><Layout size={18} /></button>
                    <button className="p-2 text-white"><ImageIcon size={18} /></button>
                  </div>
               </div>
               <div className="p-6 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  {contentList.flatMap(item => [
                    ...(item.gallery?.map(g => ({ ...g, parent: item.title })) || []),
                    ...(item.attachments?.map(a => ({ id: a.id, url: a.url, type: 'file' as const, name: a.name, parent: item.title })) || [])
                  ]).map((media, i) => (
                    <motion.div 
                      key={media.id + i}
                      whileHover={{ scale: 1.05 }}
                      className="group/media relative aspect-square bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden cursor-pointer"
                    >
                      {media.type === 'image' ? (
                        <img src={media.url} className="w-full h-full object-cover opacity-60 group-hover/media:opacity-100 transition-all" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center p-4">
                          {media.type === 'video' ? <Video className="text-orange-600" size={32} /> : <FileText className="text-blue-500" size={32} />}
                          <span className="text-[6px] font-black uppercase tracking-tighter text-gray-500 mt-2 truncate w-full text-center">{(media as any).name || 'ARTIFACT'}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/media:opacity-100 flex items-center justify-center gap-2 transition-all">
                        <button 
                          onClick={() => handleViewArtifact(media)}
                          className="p-2 bg-white text-black rounded-lg hover:scale-110 transition-transform"
                        >
                          <Eye size={12} />
                        </button>
                        <button 
                          onClick={() => handleDeleteArtifact(media)}
                          className="p-2 bg-red-600 text-white rounded-lg hover:scale-110 transition-transform"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
               </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredContent.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-black/40 border border-gray-800 rounded-3xl overflow-hidden hover:border-orange-600/50 transition-all duration-300 flex flex-col"
              >
                <div className="relative h-48 bg-gray-900">
                  <img 
                    src={item.image} 
                    alt={item.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      item.status === 'Published' ? 'bg-green-600' : 
                      item.status === 'Scheduled' ? 'bg-blue-600' : 'bg-gray-600'
                    } text-white shadow-lg shadow-black/50 border border-white/10`}>
                      {item.status}
                    </span>
                    {item.status === 'Scheduled' && (
                      <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white flex items-center gap-1 border border-white/10">
                        <Clock size={10} /> {item.scheduledDate}
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6 space-y-4 flex-1 flex flex-col">
                  <div>
                    <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">{item.category}</span>
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter leading-tight mt-1">{item.title}</h3>
                  </div>
                  
                  <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest border-t border-gray-800 pt-4">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {item.date}</span>
                    <span className="flex items-center gap-1 text-green-500"><Globe size={12} /> SEO Optimized</span>
                  </div>

                  <div className="flex gap-2 pt-4 mt-auto">
                    <button 
                      onClick={() => handleEdit(item)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-700 transition-all"
                    >
                      <FileEdit size={14} />
                      Edit Content
                    </button>
                    <button className="p-3 bg-gray-800 text-gray-400 rounded-xl hover:text-white hover:bg-gray-700 transition-all">
                      <Eye size={18} />
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this artifact? This cannot be undone.')) {
                          deleteContent(item.id);
                        }
                      }}
                      className="p-3 bg-gray-800 text-gray-400 rounded-xl hover:text-red-500 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {isEditorOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditorOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex items-center justify-between mb-8 sticky top-0 bg-gray-900 z-10 pb-4 border-b border-gray-800">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase italic tracking-tight">
                    {editingItem?.id ? 'Edit' : 'Create'} {activeTab === 'projects' ? 'Featured Project' : 'Insight Post'}
                  </h3>
                  <p className="text-gray-400 text-sm font-medium">Configure content details and search engine visibility.</p>
                </div>
                <button 
                  onClick={() => setIsEditorOpen(false)}
                  className="p-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Left Side: General Info */}
                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 border-l-2 border-orange-600 pl-3">General Information</h4>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Display Title</label>
                    <input 
                      type="text" 
                      value={editingItem?.title || ''}
                      onChange={e => setEditingItem(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-600" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Category</label>
                      <input 
                        type="text" 
                        value={editingItem?.category || ''}
                        onChange={e => setEditingItem(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-600" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Status</label>
                      <select 
                        value={editingItem?.status || 'Draft'}
                        onChange={e => setEditingItem(prev => ({ ...prev, status: e.target.value as any }))}
                        className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-orange-600"
                      >
                        <option value="Draft">Draft</option>
                        <option value="Scheduled">Scheduled (Gradual)</option>
                        <option value="Published">Published Now</option>
                      </select>
                    </div>
                  </div>

                  {editingItem?.status === 'Scheduled' && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="space-y-2 bg-blue-600/5 p-4 rounded-2xl border border-blue-600/10"
                    >
                      <label className="text-[10px] font-black uppercase text-blue-500 tracking-widest block">Release Schedule Date</label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={16} />
                        <input 
                          type="date" 
                          value={editingItem?.scheduledDate || ''}
                          onChange={e => setEditingItem(prev => ({ ...prev, scheduledDate: e.target.value }))}
                          className="w-full bg-black border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-600" 
                        />
                      </div>
                      <p className="text-[8px] text-gray-500 uppercase font-black tracking-widest mt-1 italic">Content will auto-publish at 12:00 AM on this date.</p>
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Primary Video Link (YouTube/Vimeo)</label>
                    <div className="relative">
                      <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-700" size={16} />
                      <input 
                        type="url" 
                        value={editingItem?.videoUrl || ''}
                        onChange={e => setEditingItem(prev => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="https://youtube.com/..."
                        className="w-full bg-black border border-gray-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-orange-600" 
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Featured Identity Image</label>
                    <div className="relative group/img aspect-video bg-black rounded-2xl border border-gray-800 overflow-hidden">
                      {editingItem?.image ? (
                        <img src={editingItem.image} alt="Preview" className="w-full h-full object-cover opacity-60 group-hover/img:opacity-40 transition-all" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700">
                          <ImageIcon size={48} />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all">
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="px-6 py-3 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-2xl"
                        >
                          <Upload size={16} />
                          Replace Image
                        </button>
                      </div>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        className="hidden" 
                        accept="image/*"
                      />
                    </div>
                    <p className="text-[8px] text-gray-600 uppercase font-black tracking-widest text-center mt-2 italic">Recommended: 1600x900px, Under 2MB</p>
                  </div>
                </div>

                {/* Right Side: SEO Optimization */}
                <div className="space-y-6">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-green-500 border-l-2 border-green-500 pl-3">Search Engine Optimization</h4>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">SEO Title Tag</label>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                        (editingItem?.seo?.title?.length || 0) > 60 ? 'bg-red-500/10 text-red-500' : 
                        (editingItem?.seo?.title?.length || 0) >= 50 ? 'bg-green-500/10 text-green-500' : 'text-gray-500'
                      }`}>
                        {editingItem?.seo?.title?.length || 0} / 60
                      </span>
                    </div>
                    <input 
                      type="text" 
                      value={editingItem?.seo?.title || ''}
                      onChange={e => setEditingItem(prev => ({ ...prev, seo: { ...prev.seo!, title: e.target.value } }))}
                      placeholder="Target keyword focused title..."
                      className={`w-full bg-black border rounded-xl py-3 px-4 text-white focus:outline-none transition-all ${
                        (editingItem?.seo?.title?.length || 0) > 60 ? 'border-red-600' : 'border-gray-800 focus:border-green-600'
                      }`} 
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Meta Description</label>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                        (editingItem?.seo?.description?.length || 0) > 160 ? 'bg-red-500/10 text-red-500' : 
                        (editingItem?.seo?.description?.length || 0) >= 120 ? 'bg-green-500/10 text-green-500' : 'text-gray-500'
                      }`}>
                        {editingItem?.seo?.description?.length || 0} / 160
                      </span>
                    </div>
                    <textarea 
                      rows={4}
                      value={editingItem?.seo?.description || ''}
                      onChange={e => setEditingItem(prev => ({ ...prev, seo: { ...prev.seo!, description: e.target.value } }))}
                      placeholder="160 characters to capture search interest..."
                      className={`w-full bg-black border rounded-xl py-3 px-4 text-white focus:outline-none transition-all resize-none ${
                        (editingItem?.seo?.description?.length || 0) > 160 ? 'border-red-600' : 'border-gray-800 focus:border-green-600'
                      }`} 
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest block">Social Media Caption / snippet</label>
                    <textarea 
                      rows={2}
                      value={editingItem?.seo?.caption || ''}
                      onChange={e => setEditingItem(prev => ({ ...prev, seo: { ...prev.seo!, caption: e.target.value } }))}
                      placeholder="Short catchy snippet for social sharing..."
                      className="w-full bg-black border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-green-600 resize-none" 
                    />
                  </div>
                </div>
              </div>

              {/* Media & Documentation Section */}
              <div className="mt-12 pt-12 border-t border-gray-800 space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  {/* Media Gallery */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 border-l-2 border-orange-600 pl-3">Media Gallery</h4>
                      <button 
                        onClick={() => galleryInputRef.current?.click()}
                        className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white flex items-center gap-2"
                      >
                        <Plus size={14} /> Add Media
                      </button>
                      <input 
                        type="file" 
                        ref={galleryInputRef}
                        onChange={handleGalleryUpload}
                        multiple
                        accept="image/*,video/*"
                        className="hidden" 
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {editingItem?.gallery?.map((asset) => (
                        <div key={asset.id} className="relative aspect-square rounded-xl overflow-hidden group/asset">
                          {asset.type === 'image' ? (
                            <img src={asset.url} alt="Gallery" className="w-full h-full object-cover grayscale group-hover/asset:grayscale-0 transition-all" />
                          ) : (
                            <div className="w-full h-full bg-black flex items-center justify-center">
                              <Video size={24} className="text-orange-600" />
                            </div>
                          )}
                          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/asset:opacity-100 transition-all">
                            {asset.type === 'image' && (
                              <button 
                                onClick={() => {
                                  setImageToCrop(asset.url);
                                  setCroppingSource({ type: 'gallery', id: asset.id });
                                  setIsCropperOpen(true);
                                }}
                                className="p-1.5 bg-black/60 text-white hover:bg-orange-600 rounded-lg"
                              >
                                <Crop size={12} />
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                setEditingItem(prev => ({
                                  ...prev,
                                  gallery: prev?.gallery?.filter(a => a.id !== asset.id)
                                }));
                              }}
                              className="p-1.5 bg-black/60 text-white hover:bg-red-600 transition-all rounded-lg"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        </div>
                      ))}
                      <button 
                        onClick={() => galleryInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-gray-800 flex flex-col items-center justify-center text-gray-600 hover:border-orange-600/50 hover:text-orange-600 transition-all"
                      >
                        <ImageIcon size={24} />
                        <span className="text-[8px] font-black uppercase tracking-widest mt-2">Upload</span>
                      </button>
                    </div>
                  </div>

                  {/* Documentation & Files */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500 border-l-2 border-blue-500 pl-3">Documentation & Files</h4>
                      <button 
                        onClick={() => attachmentInputRef.current?.click()}
                        className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white flex items-center gap-2"
                      >
                        <Plus size={14} /> Attach File
                      </button>
                      <input 
                        type="file" 
                        ref={attachmentInputRef}
                        onChange={handleAttachmentUpload}
                        multiple
                        className="hidden" 
                      />
                    </div>

                    <div className="space-y-2">
                      {editingItem?.attachments?.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-black border border-gray-800 rounded-xl group/file hover:border-blue-600/30 transition-all">
                          <div className="flex items-center gap-3">
                            <FileText size={18} className="text-blue-500" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest truncate max-w-[150px]">{file.name}</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover/file:opacity-100 transition-all">
                            <button className="p-1.5 text-gray-500 hover:text-white transition-all"><Download size={14} /></button>
                            <button 
                              onClick={() => {
                                setEditingItem(prev => ({
                                  ...prev,
                                  attachments: prev?.attachments?.filter(f => f.id !== file.id)
                                }));
                              }}
                              className="p-1.5 text-gray-500 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {(!editingItem?.attachments || editingItem.attachments.length === 0) && (
                        <div className="py-8 text-center border border-dashed border-gray-800 rounded-2xl">
                          <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">No legal archives attached.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-10 mt-10 border-t border-gray-800">
                <button 
                  onClick={() => setIsEditorOpen(false)}
                  className="flex-1 py-4 border border-gray-800 text-gray-400 font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-gray-800 transition-all"
                >
                  Cancel Changes
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-[2] flex items-center justify-center gap-3 py-4 bg-orange-600 text-white font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-orange-500 transition-all shadow-xl shadow-orange-600/20 active:scale-[0.98]"
                >
                  <Save size={18} />
                  Save & Publish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Cropper Modal */}
      <AnimatePresence>
        {isCropperOpen && imageToCrop && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            ></motion.div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col h-[70vh]"
            >
              <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-black text-white uppercase italic">Image Optimization</h4>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-1">Crop and resize for optimal SEO and performance.</p>
                </div>
                <button 
                  onClick={() => setIsCropperOpen(false)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative flex-1 bg-black">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={16 / 9}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              <div className="p-6 bg-gray-900 border-t border-gray-800 space-y-6">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Zoom</span>
                  <input 
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="flex-1 accent-orange-600"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsCropperOpen(false)}
                    className="flex-1 py-3 border border-gray-800 text-gray-400 font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-gray-800 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleCropSave}
                    className="flex-1 py-3 bg-orange-600 text-white font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-orange-500 transition-all flex items-center justify-center gap-2"
                  >
                    <Check size={16} />
                    Apply & Continue
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AdminLayout>
  );
}
