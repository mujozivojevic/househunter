import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { OLXListing } from './olxService';
import { UserFilter } from '@prisma/client';
import prisma from '../db/prisma';

export class TelegramService {
  private botToken: string;
  private apiUrl: string;

  constructor() {
    this.botToken = config.telegramBotToken || '';
    if (!this.botToken || this.botToken.trim() === '') {
      logger.warn('[TelegramService] TELEGRAM_BOT_TOKEN is not configured. Telegram features will be disabled.');
    } else {
      logger.info(`[TelegramService] Bot token loaded: ${this.botToken.substring(0, 10)}...`);
    }
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;
  }

  /**
   * Get bot information to verify token is valid
   */
  async getBotInfo(): Promise<{ success: boolean; info?: any; error?: string }> {
    if (!this.botToken || this.botToken.trim() === '') {
      return { success: false, error: 'Bot token not configured' };
    }

    try {
      const response = await axios.get(`${this.apiUrl}/getMe`);
      logger.info('Bot info retrieved:', response.data);
      return { success: true, info: response.data };
    } catch (error: any) {
      if (error.response) {
        const errorMsg = error.response.data?.description || 'Failed to get bot info';
        logger.error('Error getting bot info:', errorMsg);
        return { success: false, error: errorMsg };
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Send a message to a specific Telegram user
   * Returns { success: boolean, error?: string }
   */
  async sendMessage(chatId: string, message: string): Promise<{ success: boolean; error?: string }> {
    if (!this.botToken || this.botToken.trim() === '') {
      logger.warn('Telegram bot token not configured or empty');
      logger.warn(`Bot token value: "${this.botToken}" (length: ${this.botToken?.length || 0})`);
      return { success: false, error: 'Telegram bot token not configured' };
    }

    try {
      // Log request details for debugging
      logger.info(`Attempting to send Telegram message to chat_id: ${chatId} (type: ${typeof chatId})`);
      logger.info(`Using bot token: ${this.botToken.substring(0, 10)}...`);
      
      // Ensure chat_id is a string (Telegram accepts both, but let's be explicit)
      const chatIdStr = String(chatId);
      
      const response = await axios.post(`${this.apiUrl}/sendMessage`, {
        chat_id: chatIdStr,
        text: message,
        parse_mode: 'HTML',
      });
      logger.info(`Successfully sent Telegram message to ${chatIdStr}`);
      return { success: true };
    } catch (error: any) {
      if (error.response) {
        const errorData = error.response.data;
        logger.error(`Telegram API error sending to ${chatId}:`, errorData);
        
        // Handle specific Telegram API errors
        if (error.response.status === 404) {
          const errorMsg = 'User not found or has not started a conversation with the bot. Please send /start to the bot first.';
          logger.error(errorMsg);
          return { success: false, error: errorMsg };
        } else if (error.response.status === 400) {
          const errorMsg = errorData.description || 'Invalid request. Check if the chat ID is correct.';
          logger.error(errorMsg);
          return { success: false, error: errorMsg };
        } else if (error.response.status === 401) {
          const errorMsg = 'Invalid bot token. Please check your TELEGRAM_BOT_TOKEN.';
          logger.error(errorMsg);
          return { success: false, error: errorMsg };
        } else {
          const errorMsg = errorData.description || `Telegram API error: ${error.response.status}`;
          logger.error(`Status: ${error.response.status}, Data:`, JSON.stringify(errorData));
          return { success: false, error: errorMsg };
        }
      } else if (error.request) {
        const errorMsg = 'No response from Telegram API. Check your internet connection.';
        logger.error(`No response from Telegram API when sending to ${chatId}:`, error.message);
        return { success: false, error: errorMsg };
      } else {
        const errorMsg = `Error: ${error.message}`;
        logger.error(`Error sending Telegram message to ${chatId}:`, error.message);
        return { success: false, error: errorMsg };
      }
    }
  }

  /**
   * Format listing for Telegram message (new listing)
   */
  private formatListing(listing: OLXListing): string {
    const timeAgo = 'upravo sada';
    const isHouse = listing.type === 'house';
    const prefix = isHouse ? 'OPA NOVA KUCA' : 'OPA NOVI STAN';
    
    return `${prefix} - objavljen ${timeAgo}

<a href="${listing.url}">${listing.url}</a>`;
  }

  /**
   * Format price reduction message
   */
  private formatPriceReduction(listing: OLXListing, oldPrice: number): string {
    const isHouse = listing.type === 'house';
    const prefix = isHouse ? 'OPA SMANJENA CIJENA KUCA' : 'OPA SMANJENA CIJENA';
    return `${prefix} - sa ${oldPrice.toLocaleString()} na ${listing.price.toLocaleString()} KM

<a href="${listing.url}">${listing.url}</a>`;
  }

  /**
   * Check if listing matches user filter
   */
  private matchesFilter(listing: OLXListing, filter: UserFilter): boolean {
    // Price filter
    if (filter.minPrice !== null && listing.price < filter.minPrice) {
      return false;
    }
    if (filter.maxPrice !== null && listing.price > filter.maxPrice) {
      return false;
    }

    // Location filter
    if (filter.location && listing.location) {
      const filterLocation = filter.location.toLowerCase();
      const listingLocation = listing.location.toLowerCase();
      if (!listingLocation.includes(filterLocation)) {
        return false;
      }
    }

    // Type filter (apartment/house)
    if (filter.type) {
      // First check if listing has explicit type
      if (listing.type) {
        if (filter.type !== listing.type) {
          return false;
        }
      } else {
        // Fallback to checking title/description if type not available
        const titleLower = listing.title.toLowerCase();
        const descriptionLower = (listing.description || '').toLowerCase();
        const searchText = titleLower + ' ' + descriptionLower;

        if (filter.type === 'apartment' && !searchText.includes('apartment') && !searchText.includes('stan')) {
          return false;
        }
        if (filter.type === 'house' && !searchText.includes('house') && !searchText.includes('kuća')) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Check if listing was already notified globally and handle price changes
   * Broadcasts to ALL users - returns true if notifications were sent, false otherwise
   */
  private async checkAndBroadcastNotification(listing: OLXListing): Promise<boolean> {
    // Check if this listing was already notified about (global check, not per user)
    const existingListing = await prisma.listing.findUnique({
      where: { id: listing.id },
      select: { notifiedAt: true, priceAtNotification: true },
    });

    if (existingListing?.notifiedAt) {
      // Listing was already notified - check if price dropped
      if (existingListing.priceAtNotification && listing.price < existingListing.priceAtNotification) {
        // Price was lowered - broadcast price reduction alert to ALL users
        const message = this.formatPriceReduction(listing, existingListing.priceAtNotification);
        const allUsers = await prisma.user.findMany();
        
        let successCount = 0;
        for (const user of allUsers) {
          const result = await this.sendMessage(user.telegramId, message);
          if (result.success) {
            successCount++;
          }
        }
        
        // Update listing with new price
        await prisma.listing.update({
          where: { id: listing.id },
          data: {
            priceAtNotification: listing.price,
            notifiedAt: new Date(), // Update notification time
          },
        });
        
        logger.info(`Broadcasted price reduction alert for listing ${listing.id} to ${successCount}/${allUsers.length} users (${existingListing.priceAtNotification} -> ${listing.price})`);
        return successCount > 0;
      }
      // Price same or higher - don't send anything
      return false;
    } else {
      // Listing hasn't been notified - broadcast new listing alert to ALL users
      const message = this.formatListing(listing);
      const allUsers = await prisma.user.findMany();
      
      let successCount = 0;
      for (const user of allUsers) {
        const result = await this.sendMessage(user.telegramId, message);
        if (result.success) {
          successCount++;
        }
      }
      
      // Mark listing as notified
      await prisma.listing.update({
        where: { id: listing.id },
        data: {
          notifiedAt: new Date(),
          priceAtNotification: listing.price,
        },
      });
      
      logger.info(`Broadcasted new listing alert for listing ${listing.id} to ${successCount}/${allUsers.length} users`);
      return successCount > 0;
    }
  }

  /**
   * Send alert about a new listing - broadcasts to ALL users
   * Tracks notifications globally (not per user) to avoid duplicates
   * Detects price reductions and notifies all users
   */
  async sendAlert(listing: OLXListing, userFilters: UserFilter[], userId?: number): Promise<void> {
    // Broadcast to all users - check globally if listing was already notified
    await this.checkAndBroadcastNotification(listing);
  }

  /**
   * Get updates from Telegram (for polling)
   */
  async getUpdates(offset?: number): Promise<any> {
    try {
      const response = await axios.get(`${this.apiUrl}/getUpdates`, {
        params: {
          offset,
          timeout: 10, // Long polling timeout
        },
      });
      return response.data;
    } catch (error: any) {
      logger.error('Error getting Telegram updates:', error.message);
      return null;
    }
  }

  /**
   * Handle incoming message - /start initiates conversation, /name registers user
   */
  async handleMessage(update: any): Promise<void> {
    if (!update.message || !update.message.text) {
      return;
    }

    const message = update.message;
    const chatId = String(message.chat.id);
    const text = message.text.trim();
    const telegramUsername = message.from?.username || null;

    // Handle /start command - initiates conversation
    if (text === '/start' || text.startsWith('/start ')) {
      try {
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { telegramId: chatId },
        });

        if (existingUser) {
          // User already registered
          await this.sendMessage(chatId, `Dobrodošli nazad, ${existingUser.username || 'korisniče'}! 🏠\n\nVeć ste registrovani.\nVaš Telegram ID: ${chatId}\n\nZa promjenu imena, pošaljite: /name VašeIme`);
          logger.info(`User ${chatId} already registered, sent welcome back message`);
        } else {
          // New user - ask them to register with /name
          await this.sendMessage(chatId, `Dobrodošli! 👋\n\nZa registraciju i primanje obavještenja o novim stanovima, pošaljite:\n\n/name VašeIme\n\nPrimjer: /name Zakir\n\nVaš Telegram ID: ${chatId}`);
          logger.info(`New user ${chatId} sent /start, waiting for /name command`);
        }
      } catch (error: any) {
        logger.error(`Error handling /start command for ${chatId}:`, error.message);
        await this.sendMessage(chatId, 'Greška. Molimo pokušajte ponovo.');
      }
      return;
    }

    // Handle /name command - registers user
    if (text.startsWith('/name ')) {
      try {
        const name = text.substring(6).trim(); // Remove '/name ' prefix

        if (!name || name.length === 0) {
          await this.sendMessage(chatId, 'Molimo unesite ime nakon /name komande.\n\nPrimjer: /name Zakir');
          return;
        }

        // Check if user already exists
        let user = await prisma.user.findUnique({
          where: { telegramId: chatId },
        });

        if (user) {
          // Update existing user's name
          user = await prisma.user.update({
            where: { id: user.id },
            data: { username: name },
          });
          await this.sendMessage(chatId, `Ime ažurirano! 👤\n\nVaše ime: ${name}\nVaš Telegram ID: ${chatId}\n\nSada ćete primati obavještenja o novim stanovima! 🏠`);
          logger.info(`Updated user ${chatId} name to: ${name}`);
        } else {
          // Register new user
          user = await prisma.user.create({
            data: {
              telegramId: chatId,
              username: name,
            },
          });
          await this.sendMessage(chatId, `Uspešno ste registrovani! 🎉\n\nVaše ime: ${name}\nVaš Telegram ID: ${chatId}\n\nSada ćete primati obavještenja o novim stanovima koji odgovaraju vašim kriterijumima! 🏠`);
          logger.info(`Registered new user: ${chatId} with name: ${name}`);
        }
      } catch (error: any) {
        logger.error(`Error handling /name command for ${chatId}:`, error.message);
        await this.sendMessage(chatId, 'Greška pri registraciji. Molimo pokušajte ponovo.');
      }
      return;
    }

    // Handle unknown commands
    if (text.startsWith('/')) {
      await this.sendMessage(chatId, `Nepoznata komanda. Dostupne komande:\n\n/start - Počni konverzaciju\n/name VašeIme - Registruj se ili promijeni ime`);
    }
  }
}

export const telegramService = new TelegramService();

