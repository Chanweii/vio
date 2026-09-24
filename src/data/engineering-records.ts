export type SiteIntensity = string;

export interface LocalizedLabel {
  zh: string;
  en: string;
}

export interface EvidenceSource {
  label: LocalizedLabel;
  url?: string;
}

export interface ObservationRecord {
  status: 'verified' | 'pending';
  headline: LocalizedLabel;
  summary: LocalizedLabel;
  method: LocalizedLabel;
  observedAt?: string;
  source: EvidenceSource;
}

export interface EngineeringSite {
  id: string;
  city: LocalizedLabel;
  facility: LocalizedLabel;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
  distanceKm: number;
  siteIntensity: SiteIntensity;
  acceleration: string;
  application: LocalizedLabel;
  product: LocalizedLabel;
  observation: ObservationRecord;
  caseUrl: string;
}

export interface EngineeringEvent {
  id: string;
  name: LocalizedLabel;
  shortName: LocalizedLabel;
  date: string;
  magnitude: number;
  details?: {
    epicenterLocation: LocalizedLabel;
    magnitude: LocalizedLabel;
    depth: LocalizedLabel;
    maximumIntensity: LocalizedLabel;
  };
  documentedSiteCount: number;
  source: EvidenceSource;
  epicenter: {
    lat: number;
    lng: number;
    mapX: number;
    mapY: number;
  };
  defaultSiteId: string;
  sites: EngineeringSite[];
}

const pendingEventSource = (): EvidenceSource => ({
  label: {
    zh: '事件資料來源待核對',
    en: 'Event source pending verification',
  },
});

const pendingObservation = (): ObservationRecord => ({
  status: 'pending',
  headline: {
    zh: '事件後觀察紀錄待確認',
    en: 'Post-event observation pending verification',
  },
  summary: {
    zh: '目前資料尚未包含可公開引用的巡檢、維護或客戶回報紀錄；確認來源前不作性能結論。',
    en: 'No publishable inspection, maintenance, or client report is currently attached. No performance conclusion is made until the source is verified.',
  },
  method: {
    zh: '待補巡檢或客戶回報方式',
    en: 'Inspection or client reporting method pending',
  },
  source: {
    label: {
      zh: '證據來源待補',
      en: 'Evidence source pending',
    },
  },
});

// Local normalized mock data. The UI only consumes this shape, so a future
// Google Sheets or CMS adapter can replace this array without changing markup.
export const engineeringEvents: EngineeringEvent[] = [
  {
    id: 'jiasian-2010',
    name: { zh: '2010 甲仙地震', en: '2010 Jiasian Earthquake' },
    shortName: { zh: '甲仙', en: 'Jiasian' },
    date: '2010-03-04',
    magnitude: 6.4,
    documentedSiteCount: 1,
    source: pendingEventSource(),
    epicenter: { lat: 22.97, lng: 120.71, mapX: 43, mapY: 70 },
    defaultSiteId: 'tainan-data-center',
    sites: [
      {
        id: 'tainan-data-center',
        city: { zh: '台南', en: 'Tainan' },
        facility: { zh: '資料中心', en: 'Data Center' },
        lat: 23.08,
        lng: 120.27,
        mapX: 31,
        mapY: 66,
        distanceKm: 25,
        siteIntensity: '5',
        acceleration: '80–250 gal',
        application: { zh: '資訊設備耐震保護', en: 'Seismic protection for IT equipment' },
        product: { zh: '設備隔震系統', en: 'Equipment isolation system' },
        observation: pendingObservation(),
        caseUrl: '/contact/?case=jiasian-2010',
      },
    ],
  },
  {
    id: 'nantou-2013',
    name: { zh: '2013 南投地震', en: '2013 Nantou Earthquake' },
    shortName: { zh: '南投', en: 'Nantou' },
    date: '2013-03-27',
    magnitude: 6.1,
    documentedSiteCount: 3,
    source: pendingEventSource(),
    epicenter: { lat: 23.9, lng: 121.07, mapX: 55, mapY: 47 },
    defaultSiteId: 'nantou-it-room',
    sites: [
      {
        id: 'tainan-it-room',
        city: { zh: '台南', en: 'Tainan' },
        facility: { zh: '6F IT 機房', en: '6F IT Room' },
        lat: 23.02,
        lng: 120.23,
        mapX: 30,
        mapY: 67,
        distanceKm: 120,
        siteIntensity: '4',
        acceleration: '25–80 gal',
        application: { zh: '伺服器設備防護', en: 'Server equipment protection' },
        product: { zh: '設備隔震系統', en: 'Equipment isolation system' },
        observation: pendingObservation(),
        caseUrl: '/contact/?case=nantou-2013-tainan',
      },
      {
        id: 'nantou-it-room',
        city: { zh: '南投', en: 'Nantou' },
        facility: { zh: '3F IT 機房', en: '3F IT Room' },
        lat: 23.91,
        lng: 120.93,
        mapX: 50,
        mapY: 48,
        distanceKm: 2,
        siteIntensity: '6',
        acceleration: '250–400 gal',
        application: { zh: '關鍵資訊設備防護', en: 'Critical IT equipment protection' },
        product: { zh: '高性能隔震平台', en: 'High-performance isolation platform' },
        observation: pendingObservation(),
        caseUrl: '/contact/?case=nantou-2013',
      },
      {
        id: 'taipei-archive',
        city: { zh: '台北', en: 'Taipei' },
        facility: { zh: '文物庫房', en: 'Collection Storage' },
        lat: 25.04,
        lng: 121.52,
        mapX: 64,
        mapY: 16,
        distanceKm: 150,
        siteIntensity: '2',
        acceleration: '2.5–8 gal',
        application: { zh: '典藏設備防護', en: 'Collection storage protection' },
        product: { zh: '精密隔震平台', en: 'Precision isolation platform' },
        observation: pendingObservation(),
        caseUrl: '/contact/?case=nantou-2013-taipei',
      },
    ],
  },
  {
    id: 'meinong-2016',
    name: { zh: '2016 美濃地震', en: '2016 Meinong Earthquake' },
    shortName: { zh: '美濃', en: 'Meinong' },
    date: '2016-02-06',
    magnitude: 6.6,
    documentedSiteCount: 7,
    source: pendingEventSource(),
    epicenter: { lat: 22.92, lng: 120.54, mapX: 38, mapY: 72 },
    defaultSiteId: 'tainan-fab',
    sites: [
      {
        id: 'tainan-fab',
        city: { zh: '台南', en: 'Tainan' },
        facility: { zh: '半導體製程設備', en: 'Semiconductor Process Equipment' },
        lat: 23.1,
        lng: 120.28,
        mapX: 31,
        mapY: 65,
        distanceKm: 34,
        siteIntensity: '5',
        acceleration: '80–250 gal',
        application: { zh: '精密製程設備防護', en: 'Precision process equipment protection' },
        product: { zh: '客製化隔震系統', en: 'Custom isolation system' },
        observation: pendingObservation(),
        caseUrl: '/contact/?case=meinong-2016',
      },
      {
        id: 'kaohsiung-lab',
        city: { zh: '高雄', en: 'Kaohsiung' },
        facility: { zh: '精密量測實驗室', en: 'Metrology Laboratory' },
        lat: 22.64,
        lng: 120.31,
        mapX: 31,
        mapY: 78,
        distanceKm: 23,
        siteIntensity: '5',
        acceleration: '80–250 gal',
        application: { zh: '精密儀器減振', en: 'Precision instrument vibration control' },
        product: { zh: '主動式減振平台', en: 'Active vibration isolation platform' },
        observation: pendingObservation(),
        caseUrl: '/contact/?case=meinong-2016-kaohsiung',
      },
    ],
  },
  {
    id: 'taitung-2022',
    name: { zh: '2022 台東地震', en: '2022 Taitung Earthquake' },
    shortName: { zh: '台東', en: 'Taitung' },
    date: '2022-09-18',
    magnitude: 6.8,
    documentedSiteCount: 11,
    source: pendingEventSource(),
    epicenter: { lat: 23.14, lng: 121.2, mapX: 62, mapY: 66 },
    defaultSiteId: 'hualien-medical',
    sites: [
      {
        id: 'hualien-medical',
        city: { zh: '花蓮', en: 'Hualien' },
        facility: { zh: '醫療影像設備', en: 'Medical Imaging Equipment' },
        lat: 23.76,
        lng: 121.6,
        mapX: 72,
        mapY: 44,
        distanceKm: 70,
        siteIntensity: '5',
        acceleration: '80–250 gal',
        application: { zh: '醫療設備耐震防護', en: 'Seismic protection for medical equipment' },
        product: { zh: '低頻隔震平台', en: 'Low-frequency isolation platform' },
        observation: pendingObservation(),
        caseUrl: '/contact/?case=taitung-2022',
      },
      {
        id: 'taichung-control-room',
        city: { zh: '台中', en: 'Taichung' },
        facility: { zh: '控制中心', en: 'Control Center' },
        lat: 24.15,
        lng: 120.68,
        mapX: 43,
        mapY: 39,
        distanceKm: 120,
        siteIntensity: '4',
        acceleration: '25–80 gal',
        application: { zh: '控制設備穩定化', en: 'Control equipment stabilization' },
        product: { zh: '機櫃隔震底座', en: 'Rack isolation base' },
        observation: pendingObservation(),
        caseUrl: '/contact/?case=taitung-2022-taichung',
      },
    ],
  },
  {
    id: 'hualien-2024',
    name: { zh: '2024 花蓮地震', en: '2024 Hualien Earthquake' },
    shortName: { zh: '花蓮', en: 'Hualien' },
    date: '2024-04-03',
    magnitude: 7.2,
    details: {
      epicenterLocation: {
        zh: '台灣東部海域（花蓮縣政府附近／外海）',
        en: 'Off Taiwan’s east coast, near Hualien County',
      },
      magnitude: {
        zh: '7.2（極淺層地震）',
        en: '7.2 (very shallow earthquake)',
      },
      depth: {
        zh: '約 15.5 至 19.7 公里',
        en: 'Approximately 15.5–19.7 km',
      },
      maximumIntensity: {
        zh: '花蓮縣和平 6強',
        en: 'Upper 6 in Heping, Hualien County',
      },
    },
    documentedSiteCount: 18,
    source: pendingEventSource(),
    epicenter: { lat: 23.77, lng: 121.67, mapX: 75, mapY: 44 },
    defaultSiteId: 'hualien-hospital',
    sites: [
      {
        id: 'hualien-hospital',
        city: { zh: '花蓮', en: 'Hualien' },
        facility: { zh: '醫院關鍵設備', en: 'Hospital Critical Equipment' },
        lat: 23.99,
        lng: 121.61,
        mapX: 73,
        mapY: 37,
        distanceKm: 22,
        siteIntensity: '6+',
        acceleration: '400–800 gal',
        application: { zh: '醫療關鍵設備防護', en: 'Protection for critical medical equipment' },
        product: { zh: '高承載隔震系統', en: 'High-load isolation system' },
        observation: pendingObservation(),
        caseUrl: '/contact/?case=hualien-2024',
      },
      {
        id: 'taipei-museum',
        city: { zh: '台北', en: 'Taipei' },
        facility: { zh: '典藏展示設備', en: 'Museum Display Equipment' },
        lat: 25.04,
        lng: 121.52,
        mapX: 64,
        mapY: 16,
        distanceKm: 125,
        siteIntensity: '5-',
        acceleration: '80–250 gal',
        application: { zh: '文物與展示設備防護', en: 'Protection for collections and displays' },
        product: { zh: '精密隔震平台', en: 'Precision isolation platform' },
        observation: pendingObservation(),
        caseUrl: '/contact/?case=hualien-2024-taipei',
      },
      {
        id: 'hsinchu-fab',
        city: { zh: '新竹', en: 'Hsinchu' },
        facility: { zh: '半導體廠務設備', en: 'Semiconductor Facility Equipment' },
        lat: 24.78,
        lng: 121.01,
        mapX: 51,
        mapY: 24,
        distanceKm: 108,
        siteIntensity: '5-',
        acceleration: '80–250 gal',
        application: { zh: '高科技廠務設備防護', en: 'High-tech facility equipment protection' },
        product: { zh: '模組化隔震底座', en: 'Modular isolation base' },
        observation: pendingObservation(),
        caseUrl: '/contact/?case=hualien-2024-hsinchu',
      },
    ],
  },
];

export const normalizeEngineeringRecords = (records: EngineeringEvent[]) =>
  [...records].sort((a, b) => b.date.localeCompare(a.date));
