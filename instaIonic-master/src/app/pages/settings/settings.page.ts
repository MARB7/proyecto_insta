import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonButtons, IonBackButton, IonAvatar, IonIcon } from '@ionic/angular/standalone';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { cameraOutline } from 'ionicons/icons';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  standalone: true,
  imports: [IonAvatar, IonBackButton, IonButtons, IonButton, IonInput, IonContent, IonHeader, IonTitle, IonToolbar, IonIcon, CommonModule, FormsModule]
})
export class SettingsPage implements OnInit {

  name = '';
  email = '';
  password = '';
  
  file?: File;
  preview?: string;
  base = environment.storageUrl;

  constructor(private api: Api, private auth: Auth) {
    addIcons({ cameraOutline });
  }

  ngOnInit() {
    this.loadUser();
  }

  loadUser() {
    const user = this.auth.getUser();
    if (user) {
      this.name = user.name || '';
      this.email = user.email || '';
      if (user.profile?.avatar) {
        this.preview = this.base + user.profile.avatar;
      }
    }
  }

  onFileChange(ev: any) {
    const f = ev.target.files[0];
    if (f) {
      this.file = f;
      this.preview = URL.createObjectURL(f);
    }
  }

  async takePhoto() {
    const photo = await Camera.getPhoto({
      quality: 80,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera
    });

    if (photo.dataUrl) {
      this.preview = photo.dataUrl;
      this.file = this.dataUrlToFile(photo.dataUrl, 'avatar.jpg');
    }
  }

  private dataUrlToFile(dataUrl: string, filename: string): File {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  }

  save() {
    const data = {
      name: this.name,
      email: this.email,
      password: this.password
    };
    
    this.api.updateProfile(data, this.file).subscribe(res => {
      this.auth.setUser(res);
      alert('Perfil actualizado correctamente');
      this.password = ''; // clear password after update
    });
  }
}
