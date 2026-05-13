<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Friendship;
use App\Models\User;

class FriendshipController extends Controller
{
     public function send(Request $request, User $user)
    {
        if ($user->id == $request->user()->id) {
            return response()->json(['message'=>'No puedes agregarte'], 400);
        }

        $friendship = Friendship::firstOrCreate([
            'user_id' => $request->user()->id,
            'friend_id' => $user->id,
        ], [
            'status' => 'pending'
        ]);

        return $friendship;
    }

    public function accept(Request $request, Friendship $friendship)
    {
        // solo el receptor puede aceptar
        if ($friendship->friend_id !== $request->user()->id) {
            return response()->json(['message'=>'No autorizado'], 403);
        }

        $friendship->update(['status'=>'accepted']);

        return $friendship;
    }

    public function myFriends(Request $request)
    {
        $userId = $request->user()->id;
        
        $friendships = Friendship::where(function($q) use ($userId) {
            $q->where('user_id', $userId)->orWhere('friend_id', $userId);
        })->where('status', 'accepted')->get();
        
        $friendIds = [];
        foreach($friendships as $f) {
            $friendIds[] = ($f->user_id == $userId) ? $f->friend_id : $f->user_id;
        }
        
        return User::whereIn('id', $friendIds)->with('profile')->get();
    }

    public function pending(Request $request)
    {
        return \App\Models\Friendship::with('user')
            ->where('friend_id', $request->user()->id)
            ->where('status', 'pending')
            ->get();
    }

    public function searchUsers(Request $request)
    {
        $query = $request->query('q', '');
        if (strlen($query) < 1) {
            return response()->json([]);
        }

        return User::where('name', 'ILIKE', "%{$query}%")
            ->where('id', '!=', $request->user()->id)
            ->select('id', 'name', 'email')
            ->limit(10)
            ->get();
    }

    public function sendByName(Request $request)
    {
        $request->validate(['name' => 'required|string']);

        $user = User::where('name', 'ILIKE', $request->name)->first();

        if (!$user) {
            return response()->json(['message' => 'Usuario no encontrado'], 404);
        }

        if ($user->id == $request->user()->id) {
            return response()->json(['message' => 'No puedes agregarte a ti mismo'], 400);
        }

        $existing = Friendship::where(function ($q) use ($request, $user) {
            $q->where('user_id', $request->user()->id)->where('friend_id', $user->id);
        })->orWhere(function ($q) use ($request, $user) {
            $q->where('user_id', $user->id)->where('friend_id', $request->user()->id);
        })->first();

        if ($existing) {
            return response()->json(['message' => 'Ya existe una solicitud con este usuario', 'friendship' => $existing], 409);
        }

        $friendship = Friendship::create([
            'user_id' => $request->user()->id,
            'friend_id' => $user->id,
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'Solicitud enviada a ' . $user->name, 'friendship' => $friendship]);
    }
}
