import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ApiService } from '../api.service';
import { AuthService } from '../auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AppComponent } from '../app.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  updateForm = new FormGroup({
    'username' : new FormControl('', [Validators.required, Validators.minLength(3)]),
    'password' : new FormControl('', Validators.required),
    'repeat-password' : new FormControl('', Validators.required),
    'first-name' : new FormControl('', Validators.required),
    'last-name' : new FormControl('', Validators.required),
    'email' : new FormControl('', [Validators.required, Validators.email]),
  });

  wrongPass : boolean = false;
  errorMsg: string = '';

  tabs = [
    ['Administrator Settings', true], 
    ['User Settings', false], 
    ['Articles', false], 
    ['Comments', false]
  ];

  /*icons = [
    'admin-panel-settings',
    'manage-accounts',
    'newsmode',
    'comment'
  ];*/

  icons = [
    'shield',
    'person',
    'newsmode',
    'comment'
  ];

  profileUser: any;
  loggedInUser: any;
  users: any;
  articles: any;
  //comments: any;

  maySeeComments: boolean = false;
  adminLoggedIn: boolean = false;
  onOwnProfile: boolean = false;
  editingUser: boolean = false;

  interval: any;
  //helpTextLevels: string = `Help:\nlevel 0: Administrator level\nlevel 1: Writer level\nlevel 2: Comment level`;

  constructor(
    private api: ApiService, 
    private app: AppComponent, 
    private auth: AuthService, 
    private router: Router, 
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    let userId = this.route.snapshot.params['id'];
    this.auth.getUser(userId).subscribe(res => {
      console.log('get user res', res);
      console.log('res message:', res.message);
      if (res.success) {
        this.profileUser = res.data[0];
      }
    });
    this.api.getArticlesByAuthor(userId).subscribe(res => {
      console.log('get articles by author res', res);
      console.log('res message:', res.message);
      if (res.success) {
        this.articles = res.data;
      }
    });
    
    this.auth.getAllUsers().subscribe(res => {
      console.log('get all users res', res);
      console.log('res message:', res.message);
      if (res.success) {
        this.users = res.data;
      }
    });

    this.checkUser(userId);
    this.interval = setInterval(() => {
      console.log('checking user...');
      if (!sessionStorage.getItem('token')) {
        console.log('no token, clearing interval');
        clearInterval(this.interval);
      }
      this.checkUser(userId);
      if (this.loggedInUser) {
        console.log('clearing interval, user found');
        clearInterval(this.interval);
      }
    }, 200);
  }

  checkUser(profileUserId: number): void {
    if (this.app.getUser()) {
      this.loggedInUser = this.app.getUser();
      console.log('user:', this.loggedInUser, '- app user:', this.app.getUser());
      if (this.loggedInUser.id == profileUserId || this.loggedInUser.level == 0) {
        this.maySeeComments = true;
        this.onOwnProfile = this.loggedInUser.id == profileUserId;
        this.adminLoggedIn = this.loggedInUser.level == 0;
      } else {
        this.maySeeComments = false;
      }
    }
  }

  ngOnDestroy() {
    if (this.interval) {
      clearInterval(this.interval);
    }
  }

  selectTab(nmb: number): void {
    for (let i = 0; i < this.tabs.length; i++) {
      if (i == nmb) {
        this.tabs[i][1] = true;
        //setActiveTabClass(i, true);
        console.log('tab', nmb, 'activated');
      } else {
        this.tabs[i][1] = false;
        //setActiveTabClass(i, false);
      }
    }
  }

  setActiveTabStyle(tabType: number, active: any, index: number): any {
    let tempObj: any = {};
    if (active) {
      tempObj = { 
        'color': 'rgb(64, 80, 100)', 
        'border': '2px solid rgb(64, 80, 100)', 
        'border-bottom': '2px solid rgb(200, 200, 200)',
        //'font-weight': 'bold',
        'background-image': 'linear-gradient(rgb(220, 220, 220) 30%, rgb(200, 200, 200) 100%)',
        'position': 'relative',
        'top': '2px'
      };
    } else {
      tempObj = { 
        'color': 'rgba(100, 100, 100, 0.7)'
      };
    }
    if (tabType == 0) {
      delete tempObj['font-weight'];
      tempObj = Object.assign({ 'font-weight': 'bold' }, tempObj);
    } else {
      delete tempObj['font-weight'];
      tempObj = Object.assign({ 'font-weight': 'normal' }, tempObj);
    }
    if (this.setVisibility(index)) {
      delete tempObj['display'];
    } else {
      delete tempObj['display'];
      tempObj = Object.assign({ 'display': 'none' }, tempObj);
    }
    console.log('tab style:', tempObj);
    return tempObj;
  }

  setVisibility(index: number) {
    if (index == 0) {
      if (this.adminLoggedIn) return true;
      else return false;
    } else if (index == 1) {
      if (this.onOwnProfile) return true;
      else return false;
    } else if (index == 2) {
      return true;
    } else if (index == 3) {
      if (this.maySeeComments) return true;
      else return false;
    } else return false;
  }

  getRole(lvl: number): string {
    if (lvl == 0) return 'Administrator';
    else if (lvl == 1) return 'Author';
    else if (lvl == 2) return 'Commentator';
    else if (lvl == 3) return 'Banned';
    else return 'Unknown Role';
  }

  goToUserProfile(id: number): void {
    this.app.refreshPage(`profile/${id}`);
  }

  increaseLevel(u: any): void {
    if (u.level <= 0) {
      console.log('cannot increase level further, level is ' + u.level);
      return;
    }
    let tempUser = {
      id: u.id,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      level: u.level - 1
    };
    this.auth.editUser(tempUser).subscribe(res => {
      console.log('edit user res:', res);
      console.log('res message:', res.message);
      if (res.success) {
        u.level -= 1;
        console.log('level increased to', u.level);
      }
    });
  }

  decreaseLevel(u: any): void {
    if (u.level >= 2) {
      console.log('cannot decrease level further, level is ' + u.level);
      return;
    }
    let tempUser = {
      id: u.id,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      level: u.level + 1
    };
    this.auth.editUser(tempUser).subscribe(res => {
      console.log('edit user res:', res);
      console.log('res message:', res.message);
      if (res.success) {
        u.level += 1;
        console.log('level decreased to', u.level);
      }
    });
  }

  banUser(u: any): void {
    console.log('banning user ' + u.username);
    let tempUser = {
      id: u.id,
      username: u.username,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      level: 3
    };
    this.auth.editUser(tempUser).subscribe(res => {
      console.log('edit banned user res:', res);
      console.log('res message:', res.message);
      if (res.success) {
        u.level = 3;
        console.log('user banned, level set to', u.level);
      }
    });
  }

  updateUser(): void {
    if(this.updateForm.value['password'] != this.updateForm.value['repeat-password']) {
      this.wrongPass = true;
    } else {
      this.wrongPass = false;

      if (this.updateForm.valid) {
        let updatedUser = {
          id: this.profileUser.id,
          username: this.updateForm.value['username'],
          password: this.updateForm.value['password'],
          firstName: this.updateForm.value['first-name'],
          lastName: this.updateForm.value['last-name'],
          email: this.updateForm.value['email']
        };
        console.log('updated user:', updatedUser);
        this.auth.editUser(updatedUser).subscribe(res => {
          console.log('update user res message:', res);
          this.errorMsg = res.message;
          if (res.success) {
            this.profileUser.username = updatedUser.username;
            this.profileUser.firstName = updatedUser.firstName;
            this.profileUser.lastName = updatedUser.lastName;
            this.profileUser.email = updatedUser.email;
            this.editingUser = false;
            this.updateForm.reset();
            this.errorMsg = '';
            console.log('user updated');
          } else {
            console.log('user not updated');
          }
        });
      }
    }
  }

  deleteUser(id: number): void {
    this.auth.deleteUser(id).subscribe(res => {
      console.log('delete other user res:', res);
      console.log('res message:', res.message);
      if (res.success) {
        let tempUsers = this.users.filter((u: any) => {
          return u.id != id;
        });
        this.users = tempUsers;
      }
    });
  }

  selfDeleteUser(): void {
    this.auth.deleteUser(this.profileUser.id).subscribe(res => {
      console.log('delete other user res:', res);
      console.log('res message:', res.message);
      if (res.success) {
        this.app.logout();
      }
    });
  }

  startEdit(): void {
    if (!this.profileUser) return;
    console.log('updateForm before:', this.updateForm.value);
    this.updateForm.controls['username'].setValue(this.profileUser.username);
    this.updateForm.controls['first-name'].setValue(this.profileUser.firstName);
    this.updateForm.controls['last-name'].setValue(this.profileUser.lastName);
    this.updateForm.controls['email'].setValue(this.profileUser.email);
    console.log('updateForm after:', this.updateForm.value);
    this.editingUser = true;
  }

  cancelEdit(): void {
    this.editingUser = false;
    this.updateForm.reset();
  }

  transformDate(date: string): string {
    return this.app.transformDate(date);
  }

  setImageStyle(img: string): any {
    return {
      'background-image': `url(../../assets/${img})`
    };
  }

  /*levelBtnStyle(type: number, lvl: number): any {
    if (type == 1 && lvl == 0) {
      return {

      };
    }
  } */

}
