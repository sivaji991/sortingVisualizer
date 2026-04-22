import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Code, 
  Info,
  Zap,
  CheckCircle2,
  Trophy
} from 'lucide-react';

const ALGORITHMS = {
  BUBBLE: {
    name: 'Bubble Sort',
    description: 'The largest values "bubble" to the end of the array by comparing adjacent pairs.',
    code: `public void bubbleSort(int[] arr) {
    int n = arr.length;
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}`,
    complexity: 'O(n²)',
    stability: 'Stable'
  },
  SELECTION: {
    name: 'Selection Sort',
    description: 'Repeatedly finds the minimum element from the unsorted part and puts it at the beginning.',
    code: `public void selectionSort(int[] arr) {
    for (int i = 0; i < arr.length - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < arr.length; j++) {
            if (arr[j] < arr[minIdx]) minIdx = j;
        }
        int temp = arr[minIdx];
        arr[minIdx] = arr[i];
        arr[i] = temp;
    }
}`,
    complexity: 'O(n²)',
    stability: 'Unstable'
  },
  INSERTION: {
    name: 'Insertion Sort',
    description: 'Builds the final sorted array one item at a time, moving elements to their correct spot.',
    code: `public void insertionSort(int[] arr) {
    for (int i = 1; i < arr.length; i++) {
        int key = arr[i], j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
    complexity: 'O(n²)',
    stability: 'Stable'
  },
  QUICK: {
    name: 'Quick Sort',
    description: 'Uses a pivot to partition the array into smaller sub-arrays, then sorts them recursively.',
    code: `public void quickSort(int[] arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}

private int partition(int[] arr, int low, int high) {
    int pivot = arr[high];
    int i = (low - 1);
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }
    int temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    return i + 1;
}`,
    complexity: 'O(n log n)',
    stability: 'Unstable'
  },
  MERGE: {
    name: 'Merge Sort',
    description: 'Divides the array into halves, sorts them, and then merges the sorted halves back together.',
    code: `public void mergeSort(int[] arr, int l, int r) {
    if (l < r) {
        int m = l + (r - l) / 2;
        mergeSort(arr, l, m);
        mergeSort(arr, m + 1, r);
        merge(arr, l, m, r);
    }
}

private void merge(int[] arr, int l, int m, int r) {
    int n1 = m - l + 1, n2 = r - m;
    int[] L = new int[n1], R = new int[n2];
    System.arraycopy(arr, l, L, 0, n1);
    System.arraycopy(arr, m + 1, R, 0, n2);
    int i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) arr[k++] = L[i++];
        else arr[k++] = R[j++];
    }
    while (i < n1) arr[k++] = L[i++];
    while (j < n2) arr[k++] = R[j++];
}`,
    complexity: 'O(n log n)',
    stability: 'Stable'
  },
  HEAP: {
    name: 'Heap Sort',
    description: 'Organizes the array into a Max Heap, then repeatedly extracts the largest element.',
    code: `public void heapSort(int[] arr) {
    int n = arr.length;
    for (int i = n / 2 - 1; i >= 0; i--) heapify(arr, n, i);
    for (int i = n - 1; i > 0; i--) {
        int temp = arr[0];
        arr[0] = arr[i];
        arr[i] = temp;
        heapify(arr, i, 0);
    }
}

void heapify(int[] arr, int n, int i) {
    int largest = i, l = 2*i + 1, r = 2*i + 2;
    if (l < n && arr[l] > arr[largest]) largest = l;
    if (r < n && arr[r] > arr[largest]) largest = r;
    if (largest != i) {
        int swap = arr[i];
        arr[i] = arr[largest];
        arr[largest] = swap;
        heapify(arr, n, largest);
    }
}`,
    complexity: 'O(n log n)',
    stability: 'Unstable'
  }
};

const App = () => {
  const [array, setArray] = useState([50, 30, 80, 40, 20, 70, 10, 60]);
  const [algo, setAlgo] = useState('BUBBLE');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(600);
  const [history, setHistory] = useState([]);
  const [stepIndex, setStepIndex] = useState(-1);
  const [explanation, setExplanation] = useState("Choose an algorithm and click Start!");
  const [viewCode, setViewCode] = useState(false);
  
  // States for visualization highlights
  const [comparing, setComparing] = useState([]);
  const [swapping, setSwapping] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [pivotIdx, setPivotIdx] = useState(-1);

  const timerRef = useRef(null);

  const generateSteps = (type, initialArray) => {
    let steps = [];
    let arr = [...initialArray];
    let n = arr.length;

    if (type === 'BUBBLE') {
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n - i - 1; j++) {
          steps.push({ array: [...arr], comparing: [j, j + 1], msg: `Comparing ${arr[j]} and ${arr[j+1]}` });
          if (arr[j] > arr[j + 1]) {
            [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
            steps.push({ array: [...arr], swapping: [j, j + 1], msg: `Swapping ${arr[j+1]} and ${arr[j]}` });
          }
        }
        steps.push({ array: [...arr], sorted: Array.from({length: i + 1}, (_, k) => n - 1 - k), msg: `Index ${n-1-i} is locked.` });
      }
    } else if (type === 'SELECTION') {
      for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        steps.push({ array: [...arr], comparing: [i], msg: `Finding minimum in unsorted part. Current min: ${arr[i]}` });
        for (let j = i + 1; j < n; j++) {
          steps.push({ array: [...arr], comparing: [minIdx, j], msg: `Is ${arr[j]} < ${arr[minIdx]}?` });
          if (arr[j] < arr[minIdx]) {
            minIdx = j;
            steps.push({ array: [...arr], comparing: [minIdx], msg: `New minimum found: ${arr[minIdx]}` });
          }
        }
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
        steps.push({ array: [...arr], swapping: [i, minIdx], sorted: Array.from({length: i + 1}, (_, k) => k), msg: `Swapping ${arr[i]} into its correct spot.` });
      }
    } else if (type === 'INSERTION') {
      for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;
        steps.push({ array: [...arr], comparing: [i], msg: `Picking up ${key} to insert.` });
        while (j >= 0 && arr[j] > key) {
          steps.push({ array: [...arr], comparing: [j, j+1], swapping: [j+1], msg: `${arr[j]} > ${key}, shifting right.` });
          arr[j + 1] = arr[j];
          j--;
        }
        arr[j + 1] = key;
        steps.push({ array: [...arr], swapping: [j + 1], msg: `Inserted ${key} at index ${j + 1}.` });
      }
      steps.push({ array: [...arr], sorted: Array.from({length: n}, (_, k) => k), msg: "Array sorted!" });
    } else if (type === 'QUICK') {
      const quickSortHelper = (low, high) => {
        if (low < high) {
          let pivot = arr[high];
          steps.push({ array: [...arr], pivot: high, msg: `Choosing ${pivot} as the pivot.` });
          let i = low - 1;
          for (let j = low; j < high; j++) {
            steps.push({ array: [...arr], pivot: high, comparing: [j], msg: `Comparing ${arr[j]} with pivot ${pivot}.` });
            if (arr[j] < pivot) {
              i++;
              [arr[i], arr[j]] = [arr[j], arr[i]];
              steps.push({ array: [...arr], pivot: high, swapping: [i, j], msg: `Found ${arr[i]} < pivot. Moving to left partition.` });
            }
          }
          [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
          steps.push({ array: [...arr], swapping: [i+1, high], msg: `Placing pivot ${pivot} at its correct spot.` });
          let pi = i + 1;
          quickSortHelper(low, pi - 1);
          quickSortHelper(pi + 1, high);
        }
      };
      quickSortHelper(0, n - 1);
      steps.push({ array: [...arr], sorted: Array.from({length: n}, (_, k) => k), msg: "Quick Sort Complete!" });
    } else if (type === 'MERGE') {
      const merge = (l, m, r) => {
        let leftArr = arr.slice(l, m + 1);
        let rightArr = arr.slice(m + 1, r + 1);
        let i = 0, j = 0, k = l;
        steps.push({ array: [...arr], comparing: [l, r], msg: `Merging halves [${l}-${m}] and [${m+1}-${r}]` });
        while (i < leftArr.length && j < rightArr.length) {
          if (leftArr[i] <= rightArr[j]) {
            arr[k] = leftArr[i++];
          } else {
            arr[k] = rightArr[j++];
          }
          steps.push({ array: [...arr], swapping: [k], msg: `Placing ${arr[k]} into the correct relative position.` });
          k++;
        }
        while (i < leftArr.length) {
          arr[k] = leftArr[i++];
          steps.push({ array: [...arr], swapping: [k], msg: `Copying remaining element ${arr[k]}.` });
          k++;
        }
        while (j < rightArr.length) {
          arr[k] = rightArr[j++];
          steps.push({ array: [...arr], swapping: [k], msg: `Copying remaining element ${arr[k]}.` });
          k++;
        }
      };
      const sort = (l, r) => {
        if (l < r) {
          let m = Math.floor(l + (r - l) / 2);
          sort(l, m);
          sort(m + 1, r);
          merge(l, m, r);
        }
      };
      sort(0, n - 1);
      steps.push({ array: [...arr], sorted: Array.from({length: n}, (_, k) => k), msg: "Merge Sort Complete!" });
    } else if (type === 'HEAP') {
      const heapify = (size, idx) => {
        let largest = idx, l = 2 * idx + 1, r = 2 * idx + 2;
        steps.push({ array: [...arr], comparing: [idx], msg: `Heapifying at index ${idx}.` });
        if (l < size && arr[l] > arr[largest]) largest = l;
        if (r < size && arr[r] > arr[largest]) largest = r;
        if (largest !== idx) {
          [arr[idx], arr[largest]] = [arr[largest], arr[idx]];
          steps.push({ array: [...arr], swapping: [idx, largest], msg: `Swapping ${arr[idx]} and ${arr[largest]} to maintain Max Heap property.` });
          heapify(size, largest);
        }
      };
      for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
      for (let i = n - 1; i > 0; i--) {
        [arr[0], arr[i]] = [arr[i], arr[0]];
        steps.push({ array: [...arr], swapping: [0, i], msg: `Moving largest element ${arr[i]} to the end.` });
        heapify(i, 0);
      }
      steps.push({ array: [...arr], sorted: Array.from({length: n}, (_, k) => k), msg: "Heap Sort Complete!" });
    }

    return steps;
  };

  const reset = () => {
    setIsPlaying(false);
    const newArray = [50, 30, 80, 40, 20, 70, 10, 60].sort(() => Math.random() - 0.5);
    setArray(newArray);
    setStepIndex(-1);
    setHistory(generateSteps(algo, newArray));
    setComparing([]);
    setSwapping([]);
    setSortedIndices([]);
    setPivotIdx(-1);
    setExplanation(`Algorithm ${ALGORITHMS[algo].name} ready.`);
  };

  useEffect(() => { reset(); }, [algo]);

  useEffect(() => {
    if (isPlaying && stepIndex < history.length - 1) {
      timerRef.current = setTimeout(() => { handleNext(); }, speed);
    } else if (stepIndex >= history.length - 1) {
      setIsPlaying(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [isPlaying, stepIndex, history]);

  const handleNext = () => {
    if (stepIndex < history.length - 1) {
      const s = history[stepIndex + 1];
      setArray(s.array);
      setComparing(s.comparing || []);
      setSwapping(s.swapping || []);
      setSortedIndices(s.sorted || []);
      setPivotIdx(s.pivot ?? -1);
      setExplanation(s.msg);
      setStepIndex(stepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (stepIndex > 0) {
      const s = history[stepIndex - 1];
      setArray(s.array);
      setComparing(s.comparing || []);
      setSwapping(s.swapping || []);
      setSortedIndices(s.sorted || []);
      setPivotIdx(s.pivot ?? -1);
      setExplanation(s.msg);
      setStepIndex(stepIndex - 1);
    } else {
      reset();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-inner">
               <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-800">Advanced Java Sorting</h1>
              <p className="text-slate-500 text-sm">Visualizing data structures and time complexity.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(ALGORITHMS).map((key) => (
              <button
                key={key}
                onClick={() => setAlgo(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  algo === key 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 ring-2 ring-indigo-200 ring-offset-1' 
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {ALGORITHMS[key].name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visualizer */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-200 flex-1 flex flex-col min-h-[420px]">
              {/* Bars */}
              <div className="flex-1 flex items-end justify-center gap-3 mb-10 h-64">
                {array.map((value, idx) => {
                  let bgColor = 'bg-slate-200';
                  if (idx === pivotIdx) bgColor = 'bg-blue-500';
                  else if (swapping.includes(idx)) bgColor = 'bg-rose-500';
                  else if (comparing.includes(idx)) bgColor = 'bg-amber-400';
                  else if (sortedIndices.includes(idx)) bgColor = 'bg-emerald-500';

                  return (
                    <div 
                      key={idx}
                      className="flex flex-col items-center gap-2 group relative"
                      style={{ width: `${80 / array.length}%` }}
                    >
                      <div 
                        className={`w-full rounded-full transition-all duration-300 ${bgColor} flex items-end justify-center pb-3 shadow-sm`}
                        style={{ height: `${value * 2.5}px` }}
                      >
                        <span className={`text-[10px] font-black transform rotate-0 ${bgColor === 'bg-slate-200' ? 'text-slate-400' : 'text-white'}`}>
                          {value}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-300 font-mono">#{idx}</span>
                    </div>
                  );
                })}
              </div>

              {/* Console / Explanation */}
              <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-sm border-l-4 border-indigo-500 shadow-inner overflow-hidden whitespace-nowrap">
                <span className="text-slate-500 mr-2">$ log:</span>
                {explanation}
              </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button onClick={handlePrev} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 disabled:opacity-30"><ChevronLeft/></button>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)} 
                  className="px-6 h-12 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
                >
                  {isPlaying ? <Pause size={20}/> : <Play size={20}/>}
                  {isPlaying ? 'Pause' : 'Start'}
                </button>
                <button onClick={handleNext} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 disabled:opacity-30"><ChevronRight/></button>
                <button onClick={reset} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100"><RotateCcw size={20}/></button>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-400">SPEED</span>
                <input 
                  type="range" min="100" max="1000" 
                  value={1100 - speed} 
                  onChange={(e) => setSpeed(1100 - e.target.value)}
                  className="accent-indigo-600 w-32 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <button 
                onClick={() => setViewCode(!viewCode)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${
                  viewCode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Code size={18}/>
                {viewCode ? 'Hide Implementation' : 'View Java Code'}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-800">{ALGORITHMS[algo].name}</h2>
                <div className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded uppercase">
                  {ALGORITHMS[algo].complexity}
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed italic border-l-2 border-slate-100 pl-4">
                {ALGORITHMS[algo].description}
              </p>
              
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="bg-slate-50 p-3 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Worst Case</span>
                  <span className="text-sm font-bold text-slate-700">{ALGORITHMS[algo].complexity}</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Stability</span>
                  <span className="text-sm font-bold text-slate-700">{ALGORITHMS[algo].stability}</span>
                </div>
              </div>
            </div>

            {viewCode && (
              <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                  <span className="text-xs font-mono text-slate-500">AlgorithmImpl.java</span>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/30" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/30" />
                  </div>
                </div>
                <pre className="p-6 text-[11px] leading-relaxed font-mono text-indigo-300 overflow-x-auto max-h-[400px]">
                  {ALGORITHMS[algo].code}
                </pre>
              </div>
            )}

            {/* Visual Legend */}
            <div className="bg-indigo-900 text-white p-6 rounded-3xl shadow-lg shadow-indigo-100">
              <h3 className="text-xs font-black uppercase tracking-widest mb-4 opacity-50">Visual Key</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-amber-400"/> <span className="text-xs font-medium">Comparison</span></div>
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-rose-500"/> <span className="text-xs font-medium">Active Swap</span></div>
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-blue-500"/> <span className="text-xs font-medium">Pivot Element</span></div>
                <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-emerald-500"/> <span className="text-xs font-medium">Sorted/Locked</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;