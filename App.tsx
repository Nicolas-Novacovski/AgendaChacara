import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Circle, 
  Plus, 
  Layout, 
  List, 
  Sprout, 
  Trash2,
  CalendarDays,
  Menu,
  X,
  Loader2,
  Cloud,
  CloudOff,
  Database,
  ChevronLeft,
  ChevronRight,
  Wind,
  Droplets,
  Sun,
  PenTool
} from 'lucide-react';
import { Task as TaskType, ViewMode, CATEGORY_LABELS, MONTH_NAMES, DailyLog } from './types';
import { loadTasks, createTask, updateTaskStatus, deleteTaskFromDb, saveDailyLog, getLatestLogs } from './services/storageService';
import { isSupabaseConfigured } from './services/supabaseClient';
import TaskForm from './components/TaskForm';
import AssistantModal from './components/AssistantModal';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Estados para o Calendário
  const [calDate, setCalDate] = useState(new Date());
  
  // Estado para o Diário
  const [logInput, setLogInput] = useState('');
  const [isSavingLog, setIsSavingLog] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [tData, lData] = await Promise.all([loadTasks(), getLatestLogs()]);
      setTasks(tData);
      setLogs(lData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const toggleTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    const newStatus = !task.isCompleted;
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, isCompleted: newStatus } : t));
    await updateTaskStatus(taskId, newStatus);
  };

  const deleteTask = async (taskId: string) => {
    if (window.confirm('Excluir esta tarefa?')) {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      await deleteTaskFromDb(taskId);
    }
  };

  const addTask = async (newTaskData: any) => {
    const createdTask = await createTask(newTaskData);
    if (createdTask) setTasks(prev => [createdTask, ...prev]);
  };

  const handleSaveLog = async () => {
    if (!logInput.trim()) return;
    setIsSavingLog(true);
    await saveDailyLog(logInput);
    const updatedLogs = await getLatestLogs();
    setLogs(updatedLogs);
    setLogInput('');
    setIsSavingLog(false);
  };

  // Lógica do Calendário
  const calendarDays = useMemo(() => {
    const year = calDate.getFullYear();
    const month = calDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // Espaços vazios do começo
    for (let i = 0; i < firstDay; i++) days.push(null);
    // Dias do mês
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [calDate]);

  const getTasksForDay = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${calDate.getFullYear()}-${String(calDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasks.filter(t => t.specificDate === dateStr);
  };

  // Sugestões de Plantio (Simulado baseado no mês)
  const plantingTips = useMemo(() => {
    const month = new Date().getMonth();
    const tips = [
      ["Alface", "Couve", "Rabanete"], // Jan
      ["Cenoura", "Beterraba", "Salsa"], // Fev
      ["Brócolis", "Espinafre", "Ervilha"], // Mar
      ["Alho", "Cebola", "Morango"], // Abr
      ["Couve-flor", "Repolho", "Feijão"], // Mai
      ["Milho", "Abóbora", "Pepino"], // Jun
      ["Batata", "Tomate", "Pimentão"], // Jul
      ["Melancia", "Melão", "Quiabo"], // Ago
      ["Berinjela", "Jiló", "Vagem"], // Set
      ["Arroz", "Amendoim", "Soja"], // Out
      ["Mandioca", "Inhame", "Batata-doce"], // Nov
      ["Girassol", "Gergelim", "Chia"] // Dez
    ];
    return tips[month] || ["Hortaliças em geral"];
  }, []);

  const renderTaskCard = (task: TaskType) => (
    <div key={task.id} className={`group bg-white p-4 rounded-xl border transition-all duration-200 hover:shadow-md flex items-start gap-3 ${task.isCompleted ? 'border-stone-100 opacity-60' : 'border-stone-200 border-l-4 border-l-nature-moss'}`}>
      <button onClick={() => toggleTask(task.id)} className={`mt-1 transition-colors ${task.isCompleted ? 'text-nature-moss' : 'text-stone-300 hover:text-nature-moss'}`}>
        {task.isCompleted ? <CheckCircle2 size={24} /> : <Circle size={24} />}
      </button>
      <div className="flex-1">
        <h3 className={`font-bold text-lg leading-tight ${task.isCompleted ? 'line-through text-stone-400' : 'text-stone-800'}`}>{task.title}</h3>
        <div className="flex gap-2 mt-1">
          <span className="text-xs font-bold uppercase text-nature-earth bg-nature-sand px-2 py-0.5 rounded-full">{CATEGORY_LABELS[task.category]}</span>
          {task.specificDate && <span className="text-xs text-stone-500 font-medium">{new Date(task.specificDate + 'T12:00:00').toLocaleDateString('pt-BR')}</span>}
        </div>
      </div>
      <button onClick={() => deleteTask(task.id)} className="text-stone-300 hover:text-red-500 transition-opacity opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
    </div>
  );

  return (
    <div className="min-h-screen bg-nature-offWhite text-stone-800 font-sans flex flex-col lg:flex-row">
      {/* Mobile Nav */}
      <div className="lg:hidden bg-nature-mossDark text-white p-4 flex justify-between items-center sticky top-0 z-30 shadow-md">
        <span className="font-bold text-xl flex items-center gap-2"><Sprout /> Agenda da Chácara</span>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-white/10 rounded-lg">{mobileMenuOpen ? <X /> : <Menu />}</button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-72 bg-nature-mossDark text-nature-sand flex flex-col transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 hidden lg:block">
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3"><Sprout className="text-nature-moss" size={32} /> Agenda da Chácara</h1>
          <p className="text-nature-sand/40 text-xs mt-1 uppercase font-bold tracking-widest">Gestão Rural Inteligente</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 py-4">
          <button onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold ${view === 'dashboard' ? 'bg-nature-moss text-white shadow-lg' : 'hover:bg-white/5 text-stone-400'}`}><Layout size={24} /> Início</button>
          <button onClick={() => { setView('calendar'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold ${view === 'calendar' ? 'bg-nature-moss text-white shadow-lg' : 'hover:bg-white/5 text-stone-400'}`}><CalendarIcon size={24} /> Calendário</button>
          <button onClick={() => { setView('tasks'); setMobileMenuOpen(false); }} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold ${view === 'tasks' ? 'bg-nature-moss text-white shadow-lg' : 'hover:bg-white/5 text-stone-400'}`}><List size={24} /> Tarefas</button>
        </nav>

        <div className="p-6 space-y-4">
          <button onClick={() => setIsAssistantOpen(true)} className="w-full flex items-center justify-center gap-3 bg-nature-earth text-white py-4 rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all font-bold border-b-4 border-[#6a5b3d]"><Sprout size={24} /> Agrônomo Virtual</button>
          <div className="flex items-center gap-3 px-4 py-3 bg-black/20 rounded-xl">
            {isSupabaseConfigured ? <Cloud className="text-green-400" size={18} /> : <CloudOff className="text-amber-400" size={18} />}
            <span className="text-[10px] uppercase font-black tracking-widest text-stone-300">{isSupabaseConfigured ? 'Sincronizado' : 'Modo Local'}</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-10">
        <div className="max-w-5xl mx-auto space-y-10">
          {loading ? (
            <div className="h-[70vh] flex flex-col items-center justify-center text-stone-400">
              <Loader2 className="animate-spin mb-4 text-nature-moss" size={48} />
              <p className="font-bold text-lg">Organizando a lida...</p>
            </div>
          ) : (
            <>
              {view === 'dashboard' && (
                <div className="space-y-10 animate-fade-in">
                  {/* Hero Dashboard */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-nature-mossDark to-nature-moss p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                      <div className="relative z-10">
                        <p className="text-nature-sand/60 font-black uppercase text-xs tracking-widest mb-1">Status da Chácara</p>
                        <h2 className="text-4xl font-black mb-6">Bom trabalho, pai!</h2>
                        <div className="flex gap-6">
                          <div><p className="text-3xl font-black">{tasks.filter(t => !t.isCompleted).length}</p><p className="text-xs opacity-60 uppercase font-bold">Pendentes</p></div>
                          <div className="w-px h-10 bg-white/20"></div>
                          <div><p className="text-3xl font-black">{tasks.filter(t => t.isCompleted).length}</p><p className="text-xs opacity-60 uppercase font-bold">Feitas</p></div>
                        </div>
                      </div>
                      <Sprout size={160} className="absolute -bottom-10 -right-10 opacity-10 rotate-12" />
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4 text-nature-earth">
                        <CalendarDays size={28} />
                        <h3 className="font-black uppercase text-sm tracking-widest">O que plantar em {MONTH_NAMES[new Date().getMonth()]}</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {plantingTips.map(tip => (
                          <span key={tip} className="px-4 py-2 bg-nature-sand text-nature-earth rounded-xl font-bold text-sm">🌱 {tip}</span>
                        ))}
                      </div>
                      <p className="text-xs text-stone-400 mt-4 italic">* Sugestões baseadas na estação atual.</p>
                    </div>
                  </div>

                  {/* Diário da Roça */}
                  <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-nature-mossDark">
                      <PenTool size={20} />
                      <h3 className="font-black uppercase text-sm tracking-widest">Diário da Roça (Observações)</h3>
                    </div>
                    <div className="flex gap-2">
                      <input 
                        value={logInput}
                        onChange={(e) => setLogInput(e.target.value)}
                        placeholder="Ex: Choveu 20mm hoje, Geada forte na baixada..." 
                        className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-nature-moss outline-none"
                      />
                      <button 
                        onClick={handleSaveLog}
                        disabled={isSavingLog || !logInput.trim()}
                        className="px-6 py-3 bg-nature-earth text-white rounded-xl font-bold active:scale-95 disabled:opacity-50 transition-all"
                      >
                        {isSavingLog ? '...' : 'Salvar'}
                      </button>
                    </div>
                    {logs.length > 0 && (
                      <div className="space-y-2 mt-4">
                        {logs.map(log => (
                          <div key={log.id} className="text-xs bg-stone-50 p-3 rounded-lg flex justify-between gap-4 border-l-2 border-nature-earth">
                            <span className="text-stone-700 font-medium">{log.content}</span>
                            <span className="text-stone-400 shrink-0">{new Date(log.log_date + 'T12:00:00').toLocaleDateString('pt-BR')}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Tarefas de Hoje */}
                  <section>
                    <h2 className="text-xl font-black text-nature-mossDark mb-6 flex items-center gap-3"><Sun className="text-orange-400" /> Para Hoje</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {tasks.filter(t => t.specificDate === new Date().toISOString().split('T')[0] && !t.isCompleted).map(t => renderTaskCard(t))}
                      {tasks.filter(t => t.specificDate === new Date().toISOString().split('T')[0] && !t.isCompleted).length === 0 && (
                        <div className="col-span-full py-10 border-2 border-dashed border-stone-200 rounded-3xl text-center text-stone-400 font-bold">Sem tarefas marcadas para hoje.</div>
                      )}
                    </div>
                  </section>
                </div>
              )}

              {view === 'calendar' && (
                <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-xl overflow-hidden animate-fade-in">
                  <div className="bg-nature-mossDark p-8 flex justify-between items-center text-white">
                    <h2 className="text-2xl font-black capitalize">{MONTH_NAMES[calDate.getMonth()]} {calDate.getFullYear()}</h2>
                    <div className="flex gap-2">
                      <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1))} className="p-2 hover:bg-white/10 rounded-full"><ChevronLeft /></button>
                      <button onClick={() => setCalDate(new Date())} className="px-4 py-2 bg-white text-nature-mossDark rounded-xl font-black text-xs uppercase tracking-widest">Hoje</button>
                      <button onClick={() => setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1))} className="p-2 hover:bg-white/10 rounded-full"><ChevronRight /></button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-7 mb-4">
                      {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => (
                        <div key={d} className="text-center text-[10px] font-black uppercase text-stone-400 tracking-widest">{d}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {calendarDays.map((day, i) => (
                        <div key={i} className={`aspect-square rounded-2xl border flex flex-col items-center justify-center relative ${day ? 'border-stone-100 bg-stone-50/50 hover:bg-white hover:shadow-md transition-all cursor-pointer' : 'border-transparent'}`}>
                          {day && (
                            <>
                              <span className="font-bold text-stone-600">{day}</span>
                              <div className="flex gap-0.5 mt-1">
                                {getTasksForDay(day).slice(0, 3).map((t, idx) => (
                                  <div key={idx} className={`w-1.5 h-1.5 rounded-full ${t.isCompleted ? 'bg-stone-300' : 'bg-nature-moss'}`}></div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {view === 'tasks' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex justify-between items-end">
                    <h2 className="text-4xl font-black text-nature-mossDark">Tarefas</h2>
                    <span className="bg-nature-sand px-4 py-2 rounded-xl text-nature-earth font-black text-xs">{tasks.length} total</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tasks.map(t => renderTaskCard(t))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* FAB */}
        <button onClick={() => setIsFormOpen(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-nature-moss text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 border-b-4 border-nature-mossDark">
          <Plus size={32} />
        </button>
      </main>

      {/* Modals */}
      {isFormOpen && <TaskForm onClose={() => setIsFormOpen(false)} onSave={addTask} />}
      {isAssistantOpen && <AssistantModal onClose={() => setIsAssistantOpen(false)} />}
    </div>
  );
};

export default App;