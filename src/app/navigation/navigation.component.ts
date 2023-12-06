import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent {

  navMenuOpened: boolean = false;

  constructor(private router: Router) {}

  openMenu() {
    //console.log('menu before:', this.navMenuOpened);
    this.navMenuOpened = !this.navMenuOpened;
    //console.log('menu after:', this.navMenuOpened);
  }

  selectMenuItem(path: string) {
    this.navMenuOpened = false;
    this.router.navigate([path]);
  }

  setNavStyle(): any {
    if (!this.navMenuOpened) {
      return {
        'position': 'absolute',
        //'margin': '16px 10px',
        //'padding': '16px 10px'
      };
    } else {
      /*return {
        'position': 'static'
      };*/
      return '';
    }
  }

}
