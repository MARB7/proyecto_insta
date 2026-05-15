import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonButtons, IonBackButton, IonSearchbar, IonIcon, IonBadge, IonInput } from '@ionic/angular/standalone';
import { Api } from '../../services/api';
import { addIcons } from 'ionicons';
import { personAdd, checkmarkCircle, people, timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-friends',
  templateUrl: './friends.page.html',
  styleUrls: ['./friends.page.scss'],
  standalone: true,
  imports: [IonIcon, IonSearchbar, IonButtons, IonButton, IonHeader, IonToolbar, IonTitle, IonContent, IonBackButton, CommonModule, FormsModule]
})
export class FriendsPage implements OnInit {

  friends: any[] = [];
  pending: any[] = [];
  searchResults: any[] = [];
  searchQuery = '';
  message = '';
  messageColor = '';

  constructor(private api: Api) {
    addIcons({ personAdd, checkmarkCircle, people, timeOutline });
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getFriends().subscribe(res => this.friends = res);
    this.api.getPendingFriendRequests().subscribe(res => this.pending = res);
  }

  accept(req: any) {
    this.api.acceptFriendship(req.id).subscribe(_ => this.load());
  }

  onSearch(event: any) {
    const query = event.detail.value || '';
    this.searchQuery = query;
    if (query.length < 1) {
      this.searchResults = [];
      return;
    }
    this.api.searchUsers(query).subscribe(res => {
      this.searchResults = res;
    });
  }

  sendRequest(user: any) {
    this.api.sendFriendByName(user.name).subscribe({
      next: (res) => {
        this.message = res.message;
        this.messageColor = 'success';
        this.searchResults = this.searchResults.filter(u => u.id !== user.id);
        this.load();
      },
      error: (err) => {
        this.message = err.error?.message || 'Error al enviar solicitud';
        this.messageColor = 'danger';
      }
    });
  }

}
