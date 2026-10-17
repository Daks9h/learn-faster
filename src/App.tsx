/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ScreenTab, UserStats, StudyMaterial, User } from './types';
import { INITIAL_USER_STATS, LEGACY_CONCEPTS as CONCEPTS } from './data/courseStats';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { LectureView } from './components/LectureView';
import { ExamRadarView } from './components/ExamRadarView';
import { FlashcardsView } from './components/FlashcardsView';
import { QuizView } from './components/QuizView';
import { KnowledgeScoreView } from './components/KnowledgeScoreView';
import { AuthView } from './components/AuthView';
import { ProfileView } from './components/ProfileView';
import { AudioPlayerDock } from './components/AudioPlayerDock';
import { authService } from './services/authService';
import { Zap } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => authService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<ScreenTab>(() => {
    return authService.getToken() ? 'profile' : 'auth';
  });
  const [material, setMaterial] = useState<StudyMaterial | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'ready' | 'error'>('idle');
  const [stats, setStats] = useState<UserStats>(INITIAL_USER_STATS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
      return {
        ...prev,
        xpCurrent: newXp,
        level: leveledUp ? prev.level + 1 : prev.level,
        masteryOverall: Math.min(100, prev.masteryOverall + 1),
      };
    });
    triggerToast(`+${amount} XP Earned · Progress recorded!`);
  };

  const handleLaunchRevision = (conceptId: string) => {
    setActiveTab('quiz');
    triggerToast(`Targeting ${conceptId === 'ieee-rounding' ? 'IEEE 754 Floating Point' : 'Booth Multiplication'} in combat quiz!`);
  };

  const handleTrainTopic = (conceptTitle: string) => {
    setActiveTab('flashcards');
    triggerToast(`Loaded active recall deck for ${conceptTitle}!`);
  };

  const handleMaterialLoaded = (newMaterial: StudyMaterial) => {
    setMaterial(newMaterial);
    setStatus('ready');
    triggerToast('Study material generated successfully!');
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    triggerToast(`Welcome, ${user.name}!`);
    setActiveTab('profile');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    triggerToast('Signed out of session');
    setActiveTab('auth');
  };

  return (
    <div className="min-h-screen bg-page space-backdrop text-navy flex flex-col font-sans selection:bg-accent-tint selection:text-accent">
      {/* 1. TOP APP BAR CONTRACT */}
      <Header
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        stats={stats}
        currentUser={currentUser}
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-6 pb-32">
        {!currentUser ? (
          <AuthView
            currentUser={null}
            onAuthSuccess={handleAuthSuccess}
            onLogout={handleLogout}
            onNavigateHome={() => setActiveTab('auth')}
          />
        ) : (
          <>
            {activeTab === 'profile' && (
              <ProfileView
                user={currentUser}
                stats={stats}
                onUpdateUser={(updated) => {
                  setCurrentUser(updated);
                  triggerToast('Profile alignment updated!');
                }}
                onNavigate={(tab) => setActiveTab(tab)}
                onLogout={handleLogout}
              />
            )}

            {activeTab === 'home' && (
              <HomeView
                stats={stats}
                weakConcept={weakConcept}
                onNavigate={(tab) => setActiveTab(tab)}
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
                onOpenRadar={() => setActiveTab('radar')}
              />
            )}

            {activeTab === 'radar' && (
              <ExamRadarView
                material={material}
                onTrainTopic={(conceptTitle) => handleTrainTopic(conceptTitle)}
                onGoToLecture={() => setActiveTab('lecture')}
              />
            )}

            {activeTab === 'flashcards' && (
              <FlashcardsView
                material={material}
                onEarnXp={handleEarnXp}
                onGoToLecture={() => setActiveTab('lecture')}
              />
            )}

            {activeTab === 'quiz' && (
              <QuizView
                material={material}
                onEarnXp={handleEarnXp}
                onCompleteQuiz={() => setActiveTab('score')}
                onGoToLecture={() => setActiveTab('lecture')}
              />
            )}

            {activeTab === 'score' && (
              <KnowledgeScoreView
                stats={stats}
                onLaunchRevision={(id) => handleLaunchRevision(id)}
                onNavigate={(tab) => setActiveTab(tab)}
              />
            )}

            {activeTab === 'auth' && (
              <ProfileView
                user={currentUser}
                stats={stats}
                onUpdateUser={(updated) => {
                  setCurrentUser(updated);
                  triggerToast('Profile alignment updated!');
                }}
                onNavigate={(tab) => setActiveTab(tab)}
                onLogout={handleLogout}
              />
            )}
          </>
        )}
      </main>

      {/* 4. DOCKED FIELD CASSETTE / AUDIO RECAP PLAYER */}
      {currentUser && activeTab !== 'auth' && <AudioPlayerDock />}
    </div>
  );
}
