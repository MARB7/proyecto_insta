import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonAvatar, IonLabel, IonButton, IonButtons, IonInput, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { cameraOutline, exitOutline, personAdd, settingsOutline } from 'ionicons/icons';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-feed',
  templateUrl: './feed.page.html',
  styleUrls: ['./feed.page.scss'],
  standalone: true,
  imports: [IonInput, IonHeader, IonToolbar, IonTitle, IonContent,
    IonList, IonItem, IonAvatar, IonLabel, IonButton, IonButtons,
    FormsModule, CommonModule, IonIcon]
})
export class FeedPage implements OnInit {

  posts: any[] = [];
  friends: any[] = [];
  headerFriendSlots: (any | null)[] = [null, null, null, null];
  base = environment.storageUrl;

  selectedPost: any = null;
  newComment = '';
  comments: any[] = [];
  showComments = false;

  constructor(
    private api: Api,
    private router: Router,
    private auth: Auth,
  )
  {
      addIcons({cameraOutline,personAdd,exitOutline,settingsOutline});
  }

  ngOnInit() { this.load(); }

  load() {
    this.api.getFeed().subscribe(res => this.posts = res.data ?? res);
    this.api.getFriends().subscribe(res => {
      this.friends = res;
      const slots: (any | null)[] = res.slice(0, 4);
      while (slots.length < 4) slots.push(null);
      this.headerFriendSlots = slots;
    });
  }

  like(p: any) {
    this.api.likePost(p.id).subscribe(() => this.load());
  }

  goNewPost() { this.router.navigateByUrl('/new-post'); }
  goFriends() { this.router.navigateByUrl('/friends'); }
  goSettings() { this.router.navigateByUrl('/settings'); }

  imgUrl(path: string) { return this.base + path; }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarColor(name: string): string {
    const colors = [
      '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3',
      '#009688', '#FF5722', '#795548', '#607D8B', '#F44336'
    ];
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  openComments(p: any) {
    this.selectedPost = p;
    this.showComments = true;
    this.api.getComments(p.id).subscribe(res => this.comments = res);
  }

  sendComment() {
    if (!this.selectedPost || !this.newComment.trim()) return;
    this.api.commentPost(this.selectedPost.id, this.newComment).subscribe(res => {
      this.comments.unshift(res);
      this.newComment = '';
    });
  }

  closeComments() {
    this.showComments = false;
    this.selectedPost = null;
    this.comments = [];
    this.newComment = '';
  }

  logout() {
    (document.activeElement as HTMLElement)?.blur();
    this.auth.logoutRemote()?.subscribe({
      next: () => {
        this.auth.logout();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      },
      error: () => {
        this.auth.logout();
        this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    });
  }
}
