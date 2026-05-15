<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $data = $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required',
            'username' => 'required|unique:profiles,username'
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        // si por alguna razón no se creó:
        if (! $user || ! $user->id) {
            Log::error('No se pudo crear el usuario', ['data' => $data]);
            return response()->json(['message' => 'No se pudo crear el usuario'], 500);
        }

        Profile::create([
            'user_id' => $user->id,
            'username' => $data['username']
        ]);

        $token = $user->createToken('mobile')->plainTextToken;

       return response()->json([
            'user'  => $user->load('profile'),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $data = $request->validate([
            'email'=>'required|email',
            'password'=>'required'
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message'=>'Credenciales inválidas'], 401);
        }

        $token = $user->createToken('mobile')->plainTextToken;
        return response()->json(['user'=>$user->load('profile'),'token'=>$token]);
    }

    public function me(Request $request)
    {
        return $request->user()->load('profile');
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $profile = $user->profile;

        $data = $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:6',
            'avatar' => 'nullable|image|max:2048',
        ]);

        if (isset($data['name'])) {
            $user->name = $data['name'];
        }
        if (isset($data['email'])) {
            $user->email = $data['email'];
        }
        if (!empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }
        $user->save();

        if ($request->hasFile('avatar')) {
            if ($profile && $profile->avatar) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($profile->avatar);
            }
            $path = $request->file('avatar')->store('avatars', 'public');
            if ($profile) {
                $profile->avatar = $path;
                $profile->save();
            } else {
                Profile::create([
                    'user_id' => $user->id,
                    'username' => explode('@', $user->email)[0],
                    'avatar' => $path
                ]);
            }
        }

        return response()->json($user->load('profile'));
    }
}
