import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Socket } from 'ngx-socket-io';

export interface Friend {
  id: number;
  name: string;
  gender: string;
}

export interface FriendChange {
  id: number;
  friend_id: number;
  old_value: string;
  new_value: string;
}

@Component({
  selector: 'app-root',
  template: `
    <h1>Friends</h1>
    <table mat-table [dataSource]="friends" class="mat-elevation-z8">
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

    <h1>Friend Changes</h1>
    <table mat-table [dataSource]="friendChanges" class="mat-elevation-z8">
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef> Change ID </th>
        <td mat-cell *matCellDef="let change"> {{ change.id }} </td>
      </ng-container>

      <ng-container matColumnDef="friend_id">
        <th mat-header-cell *matHeaderCellDef> Friend ID </th>
        <td mat-cell *matCellDef="let change"> {{ change.friend_id }} </td>
      </ng-container>

      <ng-container matColumnDef="old_value">
        <th mat-header-cell *matHeaderCellDef> Old Value </th>
        <td mat-cell *matCellDef="let change"> {{ change.old_value }} </td>
      </ng-container>

      <ng-container matColumnDef="new_value">
        <th mat-header-cell *matHeaderCellDef> New Value </th>
        <td mat-cell *matCellDef="let change"> {{ change.new_value }} </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="changesDisplayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: changesDisplayedColumns;"></tr>
    </table>
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  friends: Friend[] = [];
  friendChanges: FriendChange[] = [];
  displayedColumns: string[] = ['id', 'name', 'gender'];
  changesDisplayedColumns: string[] = ['id', 'friend_id', 'old_value', 'new_value'];

  constructor(private http: HttpClient, private socket: Socket) {}

  ngOnInit() {
    this.socket.on('friendUpdated', (friend: Friend) => {
      console.log('Friend updated:', friend);
      const oldFriend = this.friends.find(f => f.id === friend.id);
      if (oldFriend) {
        oldFriend.name = friend.name;
      }
      this.getChanges();
    });

    this.getFriends();
    this.getChanges();
  }

  getFriends() {
    this.http.get<Friend[]>('http://localhost:3000').subscribe((data) => {
      console.log('Friends received:', data);
      this.friends = data;
    });
  }

  getChanges() {
    this.http.get<FriendChange[]>('http://localhost:3000/changes').subscribe((data) => {
      console.log('Friend changes received:', data);
      this.friendChanges = data;
    });
  }
}
