/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ScreenTab, UserStats, StudyMaterial, User } from './types';
import { 
  getUserStats, 
  saveUserStats, 
  DEMO_BERKELEY_STATS, 
  DEFAULT_NEW_USER_STATS, 
  LEGACY_CONCEPTS as CONCEPTS 
} from './data/courseStats';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage/HomePage';
import { HomeView } from './components/HomeView';
import { LectureView } from './components/LectureView';
import { ExamRadarView } from './components/ExamRadarView';
import { FlashcardsView } from './components/FlashcardsView';
import { QuizView } from './components/QuizView';
import { KnowledgeScoreView } from './components/KnowledgeScoreView';
import { AuthView } from './components/AuthView';
import { DoorLockView } from './components/DoorLockView';
import { ProfileView } from './components/ProfileView';
import { AudioPlayerDock } from './components/AudioPlayerDock';
import { demoMaterial } from './data/demoLecture';
import { authService } from './services/authService';
import { Zap } from 'lucide-react';

function getTabFromPath(path: string): ScreenTab {
  const cleanPath = path.toLowerCase().replace(/\/$/, '') || '/';
  if (cleanPath === '/' || cleanPath === '/home' || cleanPath === '/dashboard') return 'home';
  if (cleanPath === '/profile') return 'profile';
  if (cleanPath === '/camp' || cleanPath === '/basecamp') return 'camp';
  if (cleanPath === '/lecture') return 'lecture';
  if (cleanPath === '/radar' || cleanPath === '/exam-radar') return 'radar';
  if (cleanPath === '/flashcards') return 'flashcards';
  if (cleanPath === '/quiz' || cleanPath === '/quiz-arena') return 'quiz';
  if (cleanPath === '/score' || cleanPath === '/knowledge-map') return 'score';
  if (cleanPath === '/auth') return 'auth';
  return 'home';
}

function getPathForTab(tab: ScreenTab): string {
  switch (tab) {
    case 'home':
    case 'dashboard':
      return '/';
    case 'profile':
      return '/profile';
    case 'camp':
      return '/camp';
    case 'lecture':
      return '/lecture';
    case 'radar':
      return '/radar';
    case 'flashcards':
      return '/flashcards';
    case 'quiz':
      return '/quiz';
    case 'score':
      return '/score';
    case 'auth':
      return '/auth';
    default:
      return '/';
  }
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<ScreenTab>(() => {
    if (typeof window !== 'undefined') {
      return getTabFromPath(window.location.pathname);
    }
    return 'home';
  });
  const [material, setMaterial] = useState<StudyMaterial | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('learnfaster_active_material');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return null;
  });
  const [status, setStatus] = useState<'idle' | 'processing' | 'ready' | 'error'>(() => {
    if (typeof window === 'undefined') return 'idle';
    return localStorage.getItem('learnfaster_active_material') ? 'ready' : 'idle';
  });
  const [isDemoActive, setIsDemoActive] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('learnfaster_is_demo_active') === 'true';
  });
  const [stats, setStats] = useState<UserStats>(() => {
    const isDemo = typeof window !== 'undefined' && localStorage.getItem('learnfaster_is_demo_active') === 'true';
    return getUserStats(authService.getCurrentUser(), isDemo);
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync stats when user session changes
  useEffect(() => {
    setStats(getUserStats(currentUser, isDemoActive));
  }, [currentUser, isDemoActive]);

  // Sync tab with browser history
  const handleSelectTab = (tab: ScreenTab) => {
    setActiveTab(tab);
    const targetPath = getPathForTab(tab);
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      const tab = getTabFromPath(window.location.pathname);
      setActiveTab(tab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Highest urgency weak concept for "Your Next Move"
  const weakConcept = CONCEPTS.find((c) => c.status === 'weak') || CONCEPTS[1];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleEarnXp = (amount: number) => {
    setStats((prev) => {
      const newXp = prev.xpCurrent + amount;
      const leveledUp = newXp >= prev.xpTarget;
      const updatedStreak = prev.streakDays === 0 ? 1 : prev.streakDays;
      const updated: UserStats = {
        ...prev,
        streakDays: updatedStreak,
        xpCurrent: newXp,
        level: leveledUp ? prev.level + 1 : prev.level,
        xpTarget: leveledUp ? prev.xpTarget + 200 : prev.xpTarget,
        masteryOverall: Math.min(100, prev.masteryOverall + 1),
      };
      saveUserStats(currentUser, updated, isDemoActive);
      return updated;
    });
    triggerToast(`+${amount} XP Earned · Progress recorded!`);
  };

  const handleLaunchRevision = (conceptId: string) => {
    handleSelectTab('quiz');
    triggerToast(`Targeting ${conceptId === 'ieee-rounding' ? 'IEEE 754 Floating Point' : 'Booth Multiplication'} in combat quiz!`);
  };

  const handleTrainTopic = (conceptTitle: string) => {
    handleSelectTab('flashcards');
    triggerToast(`Loaded active recall deck for ${conceptTitle}!`);
  };

  const handleMaterialLoaded = (newMaterial: StudyMaterial, isDemo = false) => {
    setMaterial(newMaterial);
    setStatus('ready');
    setIsDemoActive(isDemo);
    if (typeof window !== 'undefined') {
      localStorage.setItem('learnfaster_active_material', JSON.stringify(newMaterial));
      localStorage.setItem('learnfaster_is_demo_active', isDemo ? 'true' : 'false');
    }
    if (isDemo) {
      setStats(DEMO_BERKELEY_STATS);
      saveUserStats(currentUser, DEMO_BERKELEY_STATS, true);
      triggerToast('Berkeley CS 152 Demo lecture loaded!');
    } else {
      triggerToast('Study material generated successfully!');
      handleEarnXp(50);
    }
  };

  const handleAuthSuccess = (user: User, isDemo = false) => {
    setCurrentUser(user);
    const isBerkeleyDemo = isDemo || Boolean(user.email && user.email.toLowerCase().includes('scout@berkeley.edu'));
    setIsDemoActive(isBerkeleyDemo);

    if (isBerkeleyDemo) {
      setMaterial(demoMaterial);
      setStats(DEMO_BERKELEY_STATS);
      saveUserStats(user, DEMO_BERKELEY_STATS, true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('learnfaster_active_material', JSON.stringify(demoMaterial));
        localStorage.setItem('learnfaster_is_demo_active', 'true');
      }
      triggerToast('Door unlocked! Welcome, Scout (UC Berkeley)!');
    } else {
      const userStats = getUserStats(user, false);
      setStats(userStats);
      triggerToast(`Door unlocked! Welcome, ${user.name}!`);
    }

    // The moment the user enters, the 3D Home page is the first page they encounter
    handleSelectTab('home');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsDemoActive(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('learnfaster_active_material');
      localStorage.removeItem('learnfaster_is_demo_active');
    }
    triggerToast('Door locked. Signed out of session.');
    handleSelectTab('home');
  };

  const isHome = activeTab === 'home' || activeTab === 'dashboard';

  // Dynamic course badge in top header
  const courseBadge = isDemoActive
    ? 'CS 152 (Demo)'
    : material?.courseTitle
    ? (material.courseTitle.split(/[:–-]/)[0].trim().slice(0, 14))
    : currentUser?.profileSettings?.targetCourse
    ? (currentUser.profileSettings.targetCourse.split(/[:–-]/)[0].trim().slice(0, 14))
    : null;

  // DOOR LOCK GATEWAY: If user is not authenticated, nothing in the website works or is accessible
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-page space-backdrop text-navy flex flex-col font-sans selection:bg-accent-tint selection:text-accent">
        {toastMessage && (
          <div className="fixed top-6 right-4 sm:right-8 z-50 animate-bounce">
            <div className="px-3.5 py-2 rounded-xl bg-accent text-white border-2 border-border-dark shadow-ink flex items-center gap-2 text-xs font-mono font-bold">
              <Zap className="w-4 h-4 text-accent-tint" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
        <DoorLockView onAuthSuccess={handleAuthSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page space-backdrop text-navy flex flex-col font-sans selection:bg-accent-tint selection:text-accent">
      {/* 1. TOP APP BAR CONTRACT (Only rendered & accessible when user is inside) */}
      <Header
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        stats={stats}
        currentUser={currentUser}
        courseBadge={courseBadge}
      />

      {/* 2. TOAST NOTIFICATION BADGE */}
      {toastMessage && (
        <div className="fixed top-16 right-4 sm:right-8 z-50 animate-bounce">
          <div className="px-3.5 py-2 rounded-xl bg-accent text-white border-2 border-border-dark shadow-ink flex items-center gap-2 text-xs font-mono font-bold">
            <Zap className="w-4 h-4 text-accent-tint" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 3. MAIN WORKSPACE VIEWPORT */}
      {isHome ? (
        /* Home ONLY includes the full-screen 3D scene */
        <main className="flex-1 w-full h-[calc(100vh-60px)] overflow-hidden relative">
          <HomePage onNavigate={handleSelectTab} />
        </main>
      ) : (
        /* All other views (Profile, Camp, Lecture, etc.) */
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 pb-32">
          {activeTab === 'profile' || activeTab === 'auth' ? (
            <ProfileView
              user={currentUser}
              stats={stats}
              onUpdateUser={(updated) => {
                setCurrentUser(updated);
                triggerToast('Profile alignment updated!');
              }}
              onNavigate={handleSelectTab}
              onLogout={handleLogout}
            />
          ) : (
            <>
              {activeTab === 'camp' && (
                <HomeView
                  stats={stats}
                  weakConcept={weakConcept}
                  material={material}
                  isDemoActive={isDemoActive}
                  currentUser={currentUser}
                  onNavigate={handleSelectTab}
                  onTargetRevision={() => handleLaunchRevision(weakConcept.id)}
                />
              )}

              {activeTab === 'lecture' && (
                <LectureView
                  material={material}
                  status={status}
                  onStatusChange={setStatus}
                  onMaterialLoaded={handleMaterialLoaded}
                  onExploreConcept={(id) => handleTrainTopic(id)}
                  onOpenRadar={() => handleSelectTab('radar')}
                />
              )}

              {activeTab === 'radar' && (
                <ExamRadarView
                  material={material}
                  onTrainTopic={(conceptTitle) => handleTrainTopic(conceptTitle)}
                  onGoToLecture={() => handleSelectTab('lecture')}
                />
              )}

              {activeTab === 'flashcards' && (
                <FlashcardsView
                  material={material}
                  onEarnXp={handleEarnXp}
                  onGoToLecture={() => handleSelectTab('lecture')}
                />
              )}

              {activeTab === 'quiz' && (
                <QuizView
                  material={material}
                  onEarnXp={handleEarnXp}
                  onCompleteQuiz={() => handleSelectTab('score')}
                  onGoToLecture={() => handleSelectTab('lecture')}
                />
              )}

              {activeTab === 'score' && (
                <KnowledgeScoreView
                  stats={stats}
                  material={material}
                  isDemo={isDemoActive}
                  onLaunchRevision={(id) => handleLaunchRevision(id)}
                  onNavigate={handleSelectTab}
                />
              )}
            </>
          )}
        </main>
      )}

      {/* 4. DOCKED FIELD CASSETTE / AUDIO RECAP PLAYER */}
      {activeTab !== 'auth' && !isHome && <AudioPlayerDock material={material} />}
    </div>
  );
}
