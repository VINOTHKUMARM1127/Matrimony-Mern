import { useState, useRef } from 'react';
import * as adminApi from '../../api/adminApi';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { UploadCloud, CheckCircle, AlertCircle, FileJson, Type, Copy, ClipboardList } from 'lucide-react';

const BulkUploader = () => {
  const [uploadMethod, setUploadMethod] = useState('file');
  const [file, setFile] = useState(null);
  const [pastedJson, setPastedJson] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(null);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);
  const stopRef = useRef(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.type === 'application/json') {
      setFile(selected);
      setResults(null);
    } else {
      alert('Please select a valid JSON file.');
      setFile(null);
    }
  };

  const processJsonArray = async (jsonArray) => {
    if (!Array.isArray(jsonArray)) throw new Error('JSON data must be an array of user objects.');
    if (jsonArray.length === 0) throw new Error('JSON array is empty.');

    const requiredFields = ['email', 'password', 'name', 'gender'];
    for (let i = 0; i < jsonArray.length; i++) {
      const user = jsonArray[i];
      for (const field of requiredFields) {
        if (!user[field]) {
          throw new Error(`Row ${i + 1} (${user.email || 'Unknown'}): Missing required field "${field}".`);
        }
      }
    }

    setProgress({ current: 0, total: jsonArray.length });
    const uploadResults = await adminApi.bulkUploadUsers(jsonArray, stopRef, (current, total) => {
      setProgress({ current, total });
    });
    setResults(uploadResults);
    setProgress(null);

    setFile(null);
    setPastedJson('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setResults(null);
    stopRef.current = false;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target.result);
        await processJsonArray(json);
      } catch (err) {
        console.error(err);
        alert(`Error: ${err.message}`);
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const handlePasteUpload = async () => {
    if (!pastedJson.trim()) return;
    setIsUploading(true);
    setResults(null);
    stopRef.current = false;

    try {
      const json = JSON.parse(pastedJson);
      await processJsonArray(json);
    } catch (err) {
      console.error(err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const sampleJsonStr = `[
  {
    "email": "sample@example.com",
    "password": "TempPassword123!",
    "name": "Arun Kumar",
    "gender": "male",
    "date_of_birth": "1994-08-20",
    "phone": "9876543210",
    "height_cm": 175,
    "marital_status": "never_married",
    "mother_tongue": "Tamil",
    "religion": "Hindu",
    "caste": "Mudaliar",
    "subcaste": "Arcot",
    "dosham": "no",
    "highest_qualification": "B.E. / B.Tech.",
    "education_detail": "Computer Science",
    "occupation": "Software Engineer",
    "occupation_detail": "Backend Developer",
    "company_name": "Tech Corp",
    "annual_income": "10-15 Lakhs",
    "family_type": "nuclear",
    "family_status": "upper_middle_class",
    "father_occupation": "Government Employee",
    "mother_occupation": "Homemaker",
    "number_of_brothers": 1,
    "brothers_married": 1,
    "number_of_sisters": 0,
    "sisters_married": 0,
    "city": "Chennai",
    "district": "Chennai",
    "state": "Tamil Nadu",
    "country": "India",
    "about_me": "Friendly and family-oriented.",
    "food_habit": "vegetarian",
    "smoking": "no",
    "drinking": "no",
    "languages_known": ["Tamil", "English"],
    "interests": ["Cricket", "Music"],
    "hobbies": ["Reading"],
    "horoscope": {
      "nakshatra": "Ashwini",
      "rasi": "Mesham",
      "lagnam": "Simmam",
      "gothram": "Bharadwaja",
      "dasa_balance": "Venus 3y"
    },
    "preferences": {
      "pref_age_min": 24,
      "pref_age_max": 30,
      "pref_height_min": 150,
      "pref_height_max": 170,
      "pref_religion": ["Hindu"],
      "pref_caste": ["Mudaliar"],
      "pref_education": ["B.E. / B.Tech.", "M.E."],
      "pref_occupation": ["Software Engineer"],
      "pref_marital_status": ["never_married"],
      "pref_food_habit": ["vegetarian"],
      "pref_location": ["Chennai"]
    },
    "tier": "gold",
    "profile_photos": ["https://your-cdn.com/photo1.jpg", "https://your-cdn.com/photo2.jpg"]
  }
]`;

  const copySample = () => {
    navigator.clipboard
      .writeText(sampleJsonStr)
      .then(() => alert('Sample JSON copied to clipboard!'))
      .catch((err) => alert('Failed to copy text: ' + err));
  };

  const tabBtn = (active) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
      active ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-700'
    }`;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">Bulk Upload Users</h1>
        <p className="text-neutral-500 mt-1 text-sm">
          Create many member accounts at once from a JSON array. Auth accounts and profiles are generated automatically.
        </p>
      </div>

      {/* Method toggle */}
      <div className="flex bg-neutral-100 p-1 rounded-xl mb-6 w-fit">
        <button onClick={() => setUploadMethod('file')} className={tabBtn(uploadMethod === 'file')}>
          <FileJson size={16} /> Upload File
        </button>
        <button onClick={() => setUploadMethod('paste')} className={tabBtn(uploadMethod === 'paste')}>
          <Type size={16} /> Paste JSON
        </button>
      </div>

      <Card className="p-6 sm:p-8 mb-6">
        {uploadMethod === 'file' ? (
          <div
            className="group border-2 border-dashed border-neutral-300 rounded-2xl p-10 sm:p-12 text-center hover:border-primary-300 hover:bg-primary-50/40 transition-all cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} accept=".json" className="hidden" onChange={handleFileChange} />
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${
                file ? 'bg-success-100 text-success-600' : 'bg-primary-100 text-primary-600 group-hover:scale-105'
              }`}
            >
              {file ? <CheckCircle size={30} /> : <UploadCloud size={30} />}
            </div>
            <h3 className="text-lg font-bold text-neutral-900 mb-1">
              {file ? file.name : 'Click to select a JSON file'}
            </h3>
            <p className="text-neutral-500 text-sm max-w-sm mx-auto">
              Drop in an array of user objects. We'll handle the rest.
            </p>

            {isUploading ? (
              <div className="mt-6 flex justify-center gap-3">
                <Button isLoading>
                  {progress ? `Uploading ${progress.current}/${progress.total}` : 'Uploading…'}
                </Button>
                <Button
                  variant="outline"
                  className="border-error-200 text-error-600 hover:bg-error-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    stopRef.current = true;
                  }}
                >
                  Stop
                </Button>
              </div>
            ) : (
              file && (
                <Button
                  className="mt-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFileUpload();
                  }}
                  icon={UploadCloud}
                >
                  Start Upload
                </Button>
              )
            )}
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-neutral-700">Paste your JSON array</label>
              <button
                type="button"
                onClick={() => setPastedJson(sampleJsonStr)}
                className="text-xs font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Load Sample
              </button>
            </div>
            <textarea
              className="w-full h-64 p-4 border border-neutral-200 rounded-xl font-mono text-sm bg-neutral-50 focus:bg-white focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all"
              placeholder={'[\n  {\n    "email": "user@example.com",\n    "password": "SecurePass123",\n    "name": "John Doe",\n    "gender": "male"\n  }\n]'}
              value={pastedJson}
              onChange={(e) => setPastedJson(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-3">
              {isUploading && (
                <Button
                  variant="outline"
                  className="border-error-200 text-error-600 hover:bg-error-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    stopRef.current = true;
                  }}
                >
                  Stop
                </Button>
              )}
              <Button onClick={handlePasteUpload} isLoading={isUploading} disabled={!pastedJson.trim() || isUploading} icon={ClipboardList}>
                {isUploading && progress ? `Uploading ${progress.current}/${progress.total}` : 'Process JSON'}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Results */}
      {results && (
        <Card className="p-6 mb-6 animate-rise">
          <h3 className="text-lg font-bold text-neutral-900 mb-4">Upload Results</h3>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="bg-success-50 border border-success-200 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-success-100 text-success-600 flex items-center justify-center">
                <CheckCircle size={22} />
              </div>
              <div>
                <p className="text-xs text-success-700 font-medium">Created</p>
                <p className="text-2xl font-extrabold text-success-900">{results.success}</p>
              </div>
            </div>
            <div className="bg-error-50 border border-error-200 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-error-100 text-error-600 flex items-center justify-center">
                <AlertCircle size={22} />
              </div>
              <div>
                <p className="text-xs text-error-700 font-medium">Failed</p>
                <p className="text-2xl font-extrabold text-error-900">{results.failed}</p>
              </div>
            </div>
          </div>

          {results.errors?.length > 0 && (
            <div>
              <p className="font-semibold text-neutral-900 mb-2 text-sm">Error Logs</p>
              <div className="bg-neutral-900 text-neutral-300 p-4 rounded-xl text-xs font-mono h-48 overflow-y-auto space-y-1">
                {results.errors.map((err, idx) => (
                  <div key={idx} className="text-error-400">• {err}</div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Sample */}
      <Card className="p-6 bg-gradient-to-br from-primary-50/70 to-transparent border-primary-100">
        <div className="flex justify-between items-start mb-4 gap-3">
          <div>
            <h3 className="font-bold text-neutral-900 mb-1">Expected JSON Format</h3>
            <p className="text-xs text-neutral-500">
              Required fields: <span className="font-medium text-neutral-700">email, password, name, gender</span>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={copySample} icon={Copy}>Copy</Button>
        </div>
        <pre className="bg-white p-4 rounded-xl text-xs overflow-x-auto text-neutral-700 border border-primary-100 leading-relaxed">
{sampleJsonStr}
        </pre>
      </Card>
    </div>
  );
};

export default BulkUploader;
