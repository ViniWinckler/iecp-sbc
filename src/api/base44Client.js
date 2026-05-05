import { getCurrentUser, logout as firebaseLogout } from '../services/auth.js';
import * as db from '../services/db.js';

// Facade to map base44 sdk calls to our Firebase implementation
export const base44 = {
  auth: {
    me: async () => {
      const user = getCurrentUser();
      if (!user) throw new Error("Not authenticated");
      return { email: user.email, name: user.displayName || user.email.split('@')[0], id: user.uid };
    },
    logout: async (redirectUrl) => {
      await firebaseLogout();
      if (redirectUrl) window.location.href = redirectUrl;
    },
    redirectToLogin: (redirectUrl) => {
      window.location.href = '/login';
    },
    isAuthenticated: async () => {
      return !!getCurrentUser();
    }
  },
  entities: {
    Banner: {
      filter: async () => [],
      list: async () => []
    },
    ServiceTime: {
      list: async () => [
        { id: "1", day_of_week: "Domingo", time: "09:00", name: "Culto Matutino e EBD" },
        { id: "2", day_of_week: "Domingo", time: "18:00", name: "Culto de Celebração" },
        { id: "3", day_of_week: "Quarta", time: "19:30", name: "Culto de Oração" }
      ]
    },
    DailyVerse: {
      filter: async () => [{
        text: "Porque eu bem sei os pensamentos que tenho a vosso respeito, diz o Senhor; pensamentos de paz, e não de mal, para vos dar o fim que esperais.",
        reference: "JEREMIAS 29:11"
      }],
      list: async () => []
    },
    ChurchInfo: {
      list: async () => [],
      update: async () => {},
      create: async () => {}
    },
    Pastor: {
      list: async () => [],
      create: async () => {},
      delete: async () => {}
    },
    Announcement: {
      list: async () => {
        const avisos = await db.getAvisos();
        return avisos.map(a => ({ id: a.id, title: a.Titulo, content: a.Descricao, created_date: a.Data_Hora }));
      },
      create: async (data) => {
        await db.createAviso({ Titulo: data.title, Descricao: data.content, Data_Hora: new Date().toISOString() });
      }
    },
    Ministry: {
      list: async () => {
        const min = await db.getMinisterios();
        return min.map(m => ({ id: m.id, name: m.Nome, description: m.Descricao }));
      }
    },
    MinistryMember: {
      filter: async () => [],
      update: async () => {}
    },
    CalendarEvent: {
      list: async () => [],
      create: async () => {}
    },
    ScheduleSlot: {
      filter: async () => []
    },
    Schedule: {
      list: async () => []
    }
  }
};
