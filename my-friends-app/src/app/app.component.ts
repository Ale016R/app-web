import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';

export interface Friend {
  id: number;
  name: string;
  gender: string;
}

@Component({
  selector: 'app-root',
  template: `
    <table mat-table [dataSource]="friends">
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef> ID </th>
        <td mat-cell *matCellDef="let friend"> {{ friend.id }} </td>
      </ng-container>

      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef> Name </th>
        <td mat-cell *matCellDef="let friend"> {{ friend.name }} </td>
      </ng-container>

      <ng-container matColumnDef="gender">
        <th mat-header-cell *matHeaderCellDef> Gender </th>
        <td mat-cell *matCellDef="let friend"> {{ friend.gender }} </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  friends: Friend[] = [];
  displayedColumns: string[] = ['id', 'name', 'gender'];

  constructor(private http: HttpClient, private socket: Socket) {}

  ngOnInit() {
    this.socket.on('friendCreated', (friend: Friend) => {
      console.log('New friend received:', friend);
      this.friends.push(friend);
    });

    this.getFriends();
  }

  getFriends() {
    this.http.get<Friend[]>('http://localhost:3000').subscribe((data) => {
      console.log('Friends received:', data);
      this.friends = data;
    });
  }
}
